/** Preserva relaciones históricas y bloquea cierres que invalidarían turnos futuros. */
const { Op, UniqueConstraintError } = require('sequelize');
const AppError = require('../../shared/errors/AppError');
const { sequelize, Paciente, Rol, Turno, Usuario, UsuarioPaciente } = require('../../shared/database/models');
const audit = require('../auditoria/auditoria.service');
const auth = require('../auth/auth.service');
const projection = require('./vinculo.projection');
const policy = require('./vinculo.policy');
const { PROVIDER_ROLES } = require('./vinculo.constants');

const includeProvider = { model: Usuario, as: 'prestador', include: [{ model: Rol, as: 'rol', attributes: ['codigo'] }] };
const patientOr404 = async (id, transaction, lock) => {
  const row = await Paciente.findByPk(id, { transaction, lock });
  if (!row) throw new AppError({ code: 'PACIENTE_NO_ENCONTRADO', message: 'Paciente no encontrado.', status: 404 });
  return row;
};
const activeLink = (usuarioId, pacienteId, transaction) => UsuarioPaciente.findOne({ where: { usuarioId, pacienteId, activo: true }, transaction });

const list = async (actor, pacienteId, query) => {
  await patientOr404(pacienteId);
  const actorLink = policy.isGlobal(actor) || await activeLink(actor.id, pacienteId);
  if (!actorLink) throw new AppError({ code: 'PACIENTE_NO_ENCONTRADO', message: 'Paciente no encontrado.', status: 404 });
  if (query.incluirHistorial && !policy.isGlobal(actor)) throw new AppError({ code: 'FORBIDDEN_FILTER', message: 'No podés consultar el historial.', status: 403 });
  const where = { pacienteId };
  if (!query.incluirHistorial) where.activo = query.activo;
  const rows = await UsuarioPaciente.findAll({ where, include: [includeProvider], order: [['fechaInicio', 'DESC'], ['id', 'DESC']] });
  return rows.map(projection.project);
};

const create = async (actor, pacienteId, usuarioId, req) => {
  try {
    return await sequelize.transaction(async (transaction) => {
      const paciente = await patientOr404(pacienteId, transaction, transaction.LOCK.UPDATE);
      const alreadyLinked = policy.isGlobal(actor) || await activeLink(actor.id, pacienteId, transaction);
      if (!policy.canCreate(actor, alreadyLinked)) throw new AppError({ code: 'VINCULO_CREACION_DENEGADA', message: 'No podés crear este vínculo.', status: 403 });
      if (!paciente.activo) throw new AppError({ code: 'PACIENTE_INACTIVO', message: 'El paciente está inactivo.', status: 422 });
      const usuario = await Usuario.findByPk(usuarioId, { include: [{ model: Rol, as: 'rol', attributes: ['codigo'] }], transaction, lock: transaction.LOCK.UPDATE });
      if (!usuario) throw new AppError({ code: 'USUARIO_NO_ENCONTRADO', message: 'Usuario no encontrado.', status: 404 });
      if (!usuario.activo) throw new AppError({ code: 'USUARIO_INACTIVO', message: 'El usuario está inactivo.', status: 422 });
      if (!PROVIDER_ROLES.includes(usuario.rol.codigo)) throw new AppError({ code: 'USUARIO_NO_ES_PRESTADOR', message: 'El usuario no es prestador.', status: 422 });
      if (await activeLink(usuarioId, pacienteId, transaction)) throw new AppError({ code: 'VINCULO_YA_EXISTE', message: 'El vínculo ya existe.', status: 409 });
      const row = await UsuarioPaciente.create({ usuarioId, pacienteId, vinculadoPor: actor.id, fechaInicio: new Date() }, { transaction });
      await audit.record({ actorId: actor.id, action: 'PRESTADOR_VINCULADO', resource: 'vinculo', resourceId: row.id, context: auth.context(req), transaction });
      await row.reload({ include: [includeProvider], transaction });
      return projection.project(row);
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) throw new AppError({ code: 'VINCULO_YA_EXISTE', message: 'El vínculo ya existe.', status: 409 });
    throw error;
  }
};

const unlink = (actor, pacienteId, usuarioId, motivo, req) => sequelize.transaction(async (transaction) => {
  if (!motivo) throw new AppError({ code: 'MOTIVO_DESVINCULACION_REQUERIDO', message: 'El motivo de desvinculación es obligatorio.', status: 422 });
  await patientOr404(pacienteId, transaction, transaction.LOCK.UPDATE);
  const row = await UsuarioPaciente.findOne({ where: { pacienteId, usuarioId, activo: true }, include: [includeProvider], transaction, lock: transaction.LOCK.UPDATE });
  if (!row) throw new AppError({ code: 'VINCULO_NO_ENCONTRADO', message: 'Vínculo no encontrado.', status: 404 });
  const future = await Turno.count({ where: { pacienteId, prestadorId: usuarioId, estado: { [Op.in]: ['pendiente', 'confirmado'] }, inicioAt: { [Op.gt]: new Date() } }, transaction });
  if (future) throw new AppError({ code: 'VINCULO_TIENE_TURNOS_FUTUROS', message: 'El vínculo tiene turnos futuros.', status: 409 });
  await row.update({ activo: false, fechaFin: new Date(), desvinculadoPor: actor.id, motivoDesvinculacion: motivo }, { transaction });
  await audit.record({ actorId: actor.id, action: 'PRESTADOR_DESVINCULADO', resource: 'vinculo', resourceId: row.id, context: auth.context(req), transaction });
  return projection.project(row);
});

module.exports = { list, create, unlink };
