const bcrypt = require('bcrypt');
const { Op, UniqueConstraintError } = require('sequelize');
const env = require('../../config/env');
const AppError = require('../../shared/errors/AppError');
const { sequelize, Usuario, Rol, Turno, UsuarioPaciente, UsuarioServicio, Servicio } = require('../../shared/database/models');
const { getPagination, paginationMeta } = require('../../shared/utils/pagination');
const { normalizeDni, normalizeEmail } = require('../../shared/utils/sanitize');
const { PROVIDER_ROLES } = require('../../shared/constants/roles');
const audit = require('../auditoria/auditoria.service');
const auth = require('../auth/auth.service');
const files = require('../../shared/files/file-storage.service');
const { projectUser } = require('./usuario.projection');
const policy = require('./usuario.policy');
const appointmentLocks = require('../turnos/turno-locks.service');

const context = auth.context;
const roleInclude = { model: Rol, as: 'rol', attributes: ['codigo'] };
const requireUser = async (id, options = {}) => {
  const user = await Usuario.findByPk(id, { include: [roleInclude], ...options });
  if (!user) throw new AppError({ code: 'USUARIO_NO_ENCONTRADO', message: 'Usuario no encontrado.', status: 404 });
  return user;
};
const requireRole = async (code, transaction) => {
  const role = await Rol.findOne({ where: { codigo: code }, transaction });
  if (!role) throw new AppError({ code: 'ROL_NO_HABILITADO', message: 'El rol no está habilitado.', status: 422 });
  return role;
};
const checkBusinessFields = (data) => {
  if (data.rol === 'profesional' && !data.especialidad) throw new AppError({ code: 'ESPECIALIDAD_REQUERIDA', message: 'La especialidad es obligatoria para profesionales.', status: 422 });
  if (data.rol === 'administrador' && data.visiblePublicamente) throw new AppError({ code: 'ADMINISTRADOR_NO_PUBLICABLE', message: 'Un administrador no puede publicarse.', status: 422 });
};
const translateUnique = (error) => {
  if (!(error instanceof UniqueConstraintError)) throw error;
  const email = error.parent?.constraint === 'usuarios_email_lower_uq';
  throw new AppError({ code: email ? 'USUARIO_EMAIL_DUPLICADO' : 'USUARIO_DNI_DUPLICADO', message: email ? 'El email ya está registrado.' : 'El DNI ya está registrado.', status: 409 });
};
const projectionFor = (actor, requested) => {
  const projection = requested || (actor.rol === 'administrador' ? 'administrative' : 'directory');
  if (projection === 'administrative' && actor.rol !== 'administrador') throw new AppError({ code: 'USUARIO_PROYECCION_DENEGADA', message: 'La proyección solicitada no está permitida.', status: 403 });
  return projection;
};
const list = async (actor, query) => {
  if (query.activo === false && actor.rol !== 'administrador') throw new AppError({ code: 'FORBIDDEN_FILTER', message: 'El filtro solicitado no está permitido.', status: 403 });
  const projection = projectionFor(actor, query.projection); const { page, limit, offset } = getPagination(query); const where = { activo: query.activo };
  if (query.rol) where['$rol.codigo$'] = query.rol;
  if (query.search) where[Op.or] = [{ nombre: { [Op.iLike]: `%${query.search}%` } }, { apellido: { [Op.iLike]: `%${query.search}%` } }, ...(actor.rol === 'administrador' ? [{ email: { [Op.iLike]: `%${query.search}%` } }, { dni: query.search.replace(/\D/g, '') }] : [])];
  const { rows, count } = await Usuario.findAndCountAll({ where, include: [roleInclude], limit, offset, distinct: true, order: [[query.sort, query.order.toUpperCase()], ['id', 'ASC']] });
  return { data: rows.map((user) => projectUser(user, projection)), meta: paginationMeta({ page, limit, total: count }) };
};
const get = async (actor, id) => { const user = await requireUser(id); if (!user.activo && actor.rol !== 'administrador') throw new AppError({ code: 'USUARIO_NO_ENCONTRADO', message: 'Usuario no encontrado.', status: 404 }); return projectUser(user, actor.rol === 'administrador' ? 'administrative' : 'directory'); };
const create = async (actor, data, req) => {
  checkBusinessFields(data);
  try { return await sequelize.transaction(async (transaction) => {
    const role = await requireRole(data.rol, transaction); const dni = normalizeDni(data.dni); const passwordHash = await bcrypt.hash(dni, env.bcryptRounds);
    const user = await Usuario.create({ ...data, rol: undefined, rolId: role.id, dni, email: normalizeEmail(data.email), passwordHash, activo: true }, { transaction });
    await audit.record({ actorId: actor.id, action: 'USUARIO_CREADO', resource: 'usuario', resourceId: user.id, context: context(req), transaction });
    await user.reload({ include: [roleInclude], transaction }); return projectUser(user, 'administrative');
  }); } catch (error) { return translateUnique(error); }
};
const lockLastAdmin = (transaction) => sequelize.query("SELECT pg_advisory_xact_lock(hashtext('usuarios:ultimo_administrador'))", { transaction });
const assertNoFutureAppointments = async (userId, transaction) => { const count = await Turno.count({ where: { prestadorId: userId, estado: { [Op.in]: ['pendiente', 'confirmado'] }, inicioAt: { [Op.gt]: new Date() } }, transaction }); if (count) throw new AppError({ code: 'USUARIO_TIENE_TURNOS_FUTUROS', message: 'El usuario tiene turnos futuros activos.', status: 409 }); };
const assertNotLastAdmin = async (user, nextRoleOrActive, transaction) => { if (user.rol.codigo !== 'administrador' || nextRoleOrActive === 'administrador' || nextRoleOrActive === true) return; await lockLastAdmin(transaction); const count = await Usuario.count({ include: [{ ...roleInclude, where: { codigo: 'administrador' } }], where: { activo: true }, transaction }); if (count <= 1) throw new AppError({ code: 'ULTIMO_ADMINISTRADOR_REQUERIDO', message: 'Debe permanecer al menos un administrador activo.', status: 409 }); };
const closeProviderRelations = async (userId, actorId, transaction) => { await UsuarioPaciente.update({ activo: false, fechaFin: new Date(), desvinculadoPor: actorId, motivoDesvinculacion: 'Cambio de rol o estado del prestador.' }, { where: { usuarioId: userId, activo: true }, transaction }); await UsuarioServicio.destroy({ where: { usuarioId: userId }, transaction }); };
const update = async (actor, id, data, req) => { policy.assertNotSelf(actor, id, AppError); checkBusinessFields(data); try { return await sequelize.transaction(async (transaction) => {
  if (!PROVIDER_ROLES.includes(data.rol)) await appointmentLocks.lockRelatedTo('prestadorId', id, transaction);
  const user = await requireUser(id, { transaction, lock: transaction.LOCK.UPDATE }); await assertNotLastAdmin(user, data.rol, transaction); const role = await requireRole(data.rol, transaction);
  const wasProvider = PROVIDER_ROLES.includes(user.rol.codigo); const becomesProvider = PROVIDER_ROLES.includes(data.rol); if (wasProvider && !becomesProvider) { await assertNoFutureAppointments(user.id, transaction); await closeProviderRelations(user.id, actor.id, transaction); }
  const dni = normalizeDni(data.dni); const changedDni = dni !== user.dni; const values = { ...data, rol: undefined, rolId: role.id, dni, email: normalizeEmail(data.email) }; if (changedDni) values.passwordHash = await bcrypt.hash(dni, env.bcryptRounds);
  await user.update(values, { transaction }); if (changedDni || user.rol.codigo !== data.rol) await auth.revokeUserSessions(user.id, transaction);
  await audit.record({ actorId: actor.id, action: 'USUARIO_EDITADO', resource: 'usuario', resourceId: user.id, metadata: { campos: Object.keys(data) }, context: context(req), transaction }); await user.reload({ include: [roleInclude], transaction }); return projectUser(user, 'administrative');
}); } catch (error) { return translateUnique(error); } };
const changeState = async (actor, id, active, req) => { policy.assertNotSelf(actor, id, AppError); return sequelize.transaction(async (transaction) => { if (!active) await appointmentLocks.lockRelatedTo('prestadorId', id, transaction); const user = await requireUser(id, { transaction, lock: transaction.LOCK.UPDATE }); if (user.activo === active) throw new AppError({ code: 'USUARIO_ESTADO_SIN_CAMBIOS', message: 'El usuario ya posee ese estado.', status: 409 }); await assertNotLastAdmin(user, active, transaction); if (!active && PROVIDER_ROLES.includes(user.rol.codigo)) await assertNoFutureAppointments(user.id, transaction); await user.update({ activo: active }, { transaction }); if (!active) { await auth.revokeUserSessions(user.id, transaction); await closeProviderRelations(user.id, actor.id, transaction); } await audit.record({ actorId: actor.id, action: active ? 'USUARIO_ACTIVADO' : 'USUARIO_DESACTIVADO', resource: 'usuario', resourceId: user.id, context: context(req), transaction }); return projectUser(user, 'administrative'); }); };
const resetAccess = async (actor, id, req) => { policy.assertNotSelf(actor, id, AppError); await sequelize.transaction(async (transaction) => { const user = await requireUser(id, { transaction, lock: transaction.LOCK.UPDATE }); await user.update({ passwordHash: await bcrypt.hash(user.dni, env.bcryptRounds) }, { transaction }); await auth.revokeUserSessions(user.id, transaction); await audit.record({ actorId: actor.id, action: 'ACCESO_RESTABLECIDO', resource: 'usuario', resourceId: user.id, context: context(req), transaction }); }); };
const setPhoto = async (actor, id, file, req) => { policy.assertNotSelf(actor, id, AppError); if (!file) throw new AppError({ code: 'IMAGEN_REQUERIDA', message: 'Debés adjuntar una imagen.', status: 422 }); const user = await requireUser(id); const url = await files.replaceImage({ bucket: 'usuarios', buffer: file.buffer, previousUrl: user.fotoUrl, persist: async (next) => sequelize.transaction(async (transaction) => { await user.update({ fotoUrl: next }, { transaction }); await audit.record({ actorId: actor.id, action: 'USUARIO_FOTO_ACTUALIZADA', resource: 'usuario', resourceId: id, context: context(req), transaction }); }) }); return url; };
const deletePhoto = async (actor, id, req) => { policy.assertNotSelf(actor, id, AppError); const user = await requireUser(id); await files.deleteImage({ currentUrl: user.fotoUrl, persist: async () => sequelize.transaction(async (transaction) => { await user.update({ fotoUrl: null }, { transaction }); await audit.record({ actorId: actor.id, action: 'USUARIO_FOTO_ELIMINADA', resource: 'usuario', resourceId: id, context: context(req), transaction }); }) }); };
const listServices = async (actor, id, active) => { if (!active && actor.rol !== 'administrador') throw new AppError({ code: 'FORBIDDEN_FILTER', message: 'El filtro solicitado no está permitido.', status: 403 }); await requireUser(id); const rows = await Servicio.findAll({ include: [{ model: Usuario, as: 'prestadores', where: { id }, attributes: [], through: { attributes: [] } }], where: { activo: active }, order: [['nombre', 'ASC']], attributes: ['id', 'nombre', 'descripcion', 'activo'] }); return rows.map((row) => row.get({ plain: true })); };
const addService = async (actor, id, serviceId, req) => sequelize.transaction(async (transaction) => { const user = await requireUser(id, { transaction, lock: transaction.LOCK.UPDATE }); if (!user.activo) throw new AppError({ code: 'USUARIO_INACTIVO', message: 'El usuario está inactivo.', status: 422 }); if (!PROVIDER_ROLES.includes(user.rol.codigo)) throw new AppError({ code: 'USUARIO_NO_ES_PRESTADOR', message: 'El usuario no es prestador.', status: 422 }); const service = await Servicio.findByPk(serviceId, { transaction }); if (!service) throw new AppError({ code: 'SERVICIO_NO_ENCONTRADO', message: 'Servicio no encontrado.', status: 404 }); if (!service.activo) throw new AppError({ code: 'SERVICIO_INACTIVO', message: 'El servicio está inactivo.', status: 422 }); try { const link = await UsuarioServicio.create({ usuarioId: id, servicioId: serviceId, asignadoPor: actor.id }, { transaction }); await audit.record({ actorId: actor.id, action: 'SERVICIO_ASIGNADO', resource: 'usuario_servicio', resourceId: link.id, metadata: { servicioId: serviceId }, context: context(req), transaction }); return link; } catch (error) { if (error instanceof UniqueConstraintError) throw new AppError({ code: 'SERVICIO_YA_ASIGNADO', message: 'El servicio ya está asignado.', status: 409 }); throw error; } });
const removeService = async (actor, id, serviceId, req) => sequelize.transaction(async (transaction) => { const link = await UsuarioServicio.findOne({ where: { usuarioId: id, servicioId: serviceId }, transaction, lock: transaction.LOCK.UPDATE }); if (!link) throw new AppError({ code: 'SERVICIO_ASIGNACION_NO_ENCONTRADA', message: 'La asignación no existe.', status: 404 }); await link.destroy({ transaction }); await audit.record({ actorId: actor.id, action: 'SERVICIO_QUITADO', resource: 'usuario_servicio', resourceId: link.id, metadata: { servicioId: serviceId }, context: context(req), transaction }); });

module.exports = { list, get, create, update, changeState, resetAccess, setPhoto, deletePhoto, listServices, addService, removeService, requireUser };
