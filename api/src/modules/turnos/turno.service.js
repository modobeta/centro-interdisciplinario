/** Coordina agenda, bloqueos y constraints para resolver correctamente solicitudes concurrentes. */
const { Op } = require('sequelize');
const { DateTime } = require('luxon');
const AppError = require('../../shared/errors/AppError');
const { sequelize, Consultorio, Paciente, Rol, Servicio, Turno, Usuario, UsuarioPaciente } = require('../../shared/database/models');
const { TERMINAL_STATES } = require('../../shared/constants/appointmentStates');
const { buildAppointmentInterval, parseCivilDate } = require('../../shared/utils/dateTime');
const { getPagination, paginationMeta } = require('../../shared/utils/pagination');
const audit = require('../auditoria/auditoria.service');
const auth = require('../auth/auth.service');
const policy = require('./turno.policy');

const include = [
  { model: Paciente, as: 'paciente', attributes: ['id', 'nombre', 'apellido'] },
  { model: Usuario, as: 'prestador', attributes: ['id', 'nombre', 'apellido'] },
  { model: Servicio, as: 'servicio', attributes: ['id', 'nombre'] },
  { model: Consultorio, as: 'consultorio', attributes: ['id', 'nombre'] }
];
const person = (row) => ({ id: row.id, nombreCompleto: `${row.nombre} ${row.apellido}` });
const event = (row) => ({ id: row.id, inicioAt: row.inicioAt, finAt: row.finAt, duracionMinutos: row.duracionMinutos, estado: row.estado, paciente: person(row.paciente), prestador: person(row.prestador), servicio: { id: row.servicio.id, nombre: row.servicio.nombre }, consultorio: { id: row.consultorio.id, nombre: row.consultorio.nombre } });
const detail = (row, actor) => {
  const data = { ...event(row), observacionAdministrativa: row.observacionAdministrativa, creadoPor: row.creador ? person(row.creador) : null, cancelacion: row.estado === 'cancelado' ? { motivo: row.motivoCancelacion, canceladoAt: row.canceladoAt, canceladoPor: row.cancelador ? person(row.cancelador) : null } : null, createdAt: row.createdAt, updatedAt: row.updatedAt };
  if (policy.canSeeInternal(actor, row)) data.notasInternas = row.notasInternas;
  return data;
};
const detailInclude = [...include, { model: Usuario, as: 'creador', attributes: ['id', 'nombre', 'apellido'], required: false }, { model: Usuario, as: 'cancelador', attributes: ['id', 'nombre', 'apellido'], required: false }];
const fail = (code, message, status) => { throw new AppError({ code, message, status }); };
const interval = (data) => {
  const value = buildAppointmentInterval(data);
  if (!value.start.isValid || value.start.weekday === 7 || value.start < DateTime.now().setZone(value.start.zoneName).startOf('day')) fail('TURNO_FECHA_INVALIDA', 'La fecha del turno no es válida.', 422);
  if (value.start.minute % 15 || value.start.hour < 8 || value.end.hour > 21 || (value.end.hour === 21 && value.end.minute > 0) || value.end.toISODate() !== value.start.toISODate()) fail('TURNO_HORARIO_INVALIDO', 'El horario del turno no es válido.', 422);
  return { inicioAt: value.start.toUTC().toJSDate(), finAt: value.end.toUTC().toJSDate() };
};
const requireTurn = async (actor, id, options = {}) => { const row = await Turno.findByPk(id, { include: detailInclude, ...options }); if (!row || !policy.canAccess(actor, row)) fail('TURNO_NO_ENCONTRADO', 'Turno no encontrado.', 404); return row; };

const list = async (actor, query) => {
  if (!policy.isGlobal(actor) && query.prestadorId && query.prestadorId !== actor.id) fail('FORBIDDEN_FILTER', 'El filtro solicitado no está permitido.', 403);
  if ((query.desde && !query.hasta) || (!query.desde && query.hasta)) fail('RANGO_FECHAS_INVALIDO', 'El rango de fechas está incompleto.', 400);
  const where = {};
  if (!policy.isGlobal(actor)) where.prestadorId = actor.id; else if (query.prestadorId) where.prestadorId = query.prestadorId;
  for (const key of ['pacienteId', 'consultorioId', 'servicioId', 'estado']) if (query[key]) where[key] = query[key];
  if (query.desde) {
    const from = DateTime.fromISO(query.desde, { setZone: true }); const to = DateTime.fromISO(query.hasta, { setZone: true });
    if (!from.isValid || !to.isValid || to <= from) fail('RANGO_FECHAS_INVALIDO', 'El rango de fechas no es válido.', 400);
    if (to.diff(from, 'days').days > 31) fail('RANGO_FECHAS_EXCEDIDO', 'El rango no puede superar 31 días.', 422);
    where.inicioAt = { [Op.gte]: from.toJSDate(), [Op.lt]: to.toJSDate() };
  }
  const { page, limit, offset } = getPagination(query); const { rows, count } = await Turno.findAndCountAll({ where, include, limit, offset, order: [[query.sort, query.order.toUpperCase()], ['id', query.order.toUpperCase()]], distinct: true });
  return { data: rows.map(event), meta: paginationMeta({ page, limit, total: count }) };
};

const availability = async (query) => {
  const day = parseCivilDate(query.fecha);
  if (!day.isValid || day.weekday === 7 || day < DateTime.now().setZone(day.zoneName).startOf('day')) fail('TURNO_FECHA_INVALIDA', 'La fecha no es válida.', 422);
  if (query.prestadorId) { const p = await Usuario.findByPk(query.prestadorId, { include: [{ model: Rol, as: 'rol', attributes: ['codigo'] }] }); if (!p || !['coordinacion', 'profesional'].includes(p.rol.codigo)) fail('PRESTADOR_NO_ENCONTRADO', 'Prestador no encontrado.', 404); }
  if (query.consultorioId && !await Consultorio.findByPk(query.consultorioId)) fail('CONSULTORIO_NO_ENCONTRADO', 'Consultorio no encontrado.', 404);
  const start = day.set({ hour: 8 }); const end = day.set({ hour: 21 }); const where = { estado: { [Op.in]: ['pendiente', 'confirmado'] }, inicioAt: { [Op.lt]: end.toUTC().toJSDate() }, finAt: { [Op.gt]: start.toUTC().toJSDate() } };
  if (query.prestadorId && query.consultorioId) where[Op.or] = [{ prestadorId: query.prestadorId }, { consultorioId: query.consultorioId }]; else if (query.prestadorId) where.prestadorId = query.prestadorId; else where.consultorioId = query.consultorioId;
  const occupied = await Turno.findAll({ where, attributes: ['inicioAt', 'finAt', 'prestadorId', 'consultorioId'] }); const intervals = [];
  for (let cursor = start; cursor.plus({ minutes: query.duracionMinutos }) <= end; cursor = cursor.plus({ minutes: 15 })) { const finish = cursor.plus({ minutes: query.duracionMinutos }); const clash = occupied.some((row) => row.inicioAt < finish.toUTC().toJSDate() && row.finAt > cursor.toUTC().toJSDate()); if (!clash) intervals.push({ horaInicio: cursor.toFormat('HH:mm'), horaFin: finish.toFormat('HH:mm') }); }
  return { fecha: query.fecha, franja: { desde: '08:00', hasta: '21:00' }, duracionMinutos: query.duracionMinutos, intervalosDisponibles: intervals };
};

const translateConflict = (error) => {
  const names = { turnos_prestador_no_overlap: 'TURNO_CONFLICTO_PRESTADOR', turnos_paciente_no_overlap: 'TURNO_CONFLICTO_PACIENTE', turnos_consultorio_no_overlap: 'TURNO_CONFLICTO_CONSULTORIO' };
  const code = names[error.constraint] || 'TURNO_CONFLICTO_HORARIO';
  if (error.parent?.code === '23P01') throw new AppError({ code, message: 'El horario se superpone con otro turno.', status: 409 });
  throw error;
};
const create = async (actor, data, req) => {
  if (!policy.isGlobal(actor) && data.prestadorId !== actor.id) fail('TURNO_PRESTADOR_AJENO', 'Solo podés crear turnos propios.', 403);
  if (data.notasInternas != null && actor.rol !== 'coordinacion' && data.prestadorId !== actor.id) fail('TURNO_NOTAS_INTERNAS_DENEGADAS', 'No podés definir notas internas.', 403);
  const times = interval(data);
  try { return await sequelize.transaction(async (transaction) => {
    const paciente = await Paciente.findByPk(data.pacienteId, { transaction, lock: transaction.LOCK.UPDATE }); if (!paciente) fail('PACIENTE_NO_ENCONTRADO', 'Paciente no encontrado.', 404); if (!paciente.activo) fail('PACIENTE_INACTIVO', 'Paciente inactivo.', 422);
    const prestador = await Usuario.findByPk(data.prestadorId, { include: [{ model: Rol, as: 'rol', attributes: ['codigo'] }], transaction, lock: transaction.LOCK.UPDATE }); if (!prestador || !['coordinacion', 'profesional'].includes(prestador.rol.codigo)) fail('PRESTADOR_NO_ENCONTRADO', 'Prestador no encontrado.', 404); if (!prestador.activo) fail('PRESTADOR_INACTIVO', 'Prestador inactivo.', 422);
    const servicio = await Servicio.findByPk(data.servicioId, { transaction, lock: transaction.LOCK.UPDATE }); if (!servicio) fail('SERVICIO_NO_ENCONTRADO', 'Servicio no encontrado.', 404); if (!servicio.activo) fail('SERVICIO_INACTIVO', 'Servicio inactivo.', 422);
    const consultorio = await Consultorio.findByPk(data.consultorioId, { transaction, lock: transaction.LOCK.UPDATE }); if (!consultorio) fail('CONSULTORIO_NO_ENCONTRADO', 'Consultorio no encontrado.', 404); if (!consultorio.activo) fail('CONSULTORIO_INACTIVO', 'Consultorio inactivo.', 422);
    let link = await UsuarioPaciente.findOne({ where: { usuarioId: data.prestadorId, pacienteId: data.pacienteId, activo: true }, transaction });
    if (!link && actor.rol === 'profesional') fail('PACIENTE_NO_VINCULADO', 'El paciente no está vinculado.', 403);
    if (!link) { link = await UsuarioPaciente.create({ usuarioId: data.prestadorId, pacienteId: data.pacienteId, vinculadoPor: actor.id, fechaInicio: new Date() }, { transaction }); await audit.record({ actorId: actor.id, action: 'PRESTADOR_VINCULADO_AUTOMATICAMENTE', resource: 'vinculo', resourceId: link.id, metadata: { pacienteId: data.pacienteId, prestadorId: data.prestadorId }, context: auth.context(req), transaction }); }
    const row = await Turno.create({ ...data, ...times, estado: 'pendiente', creadoPor: actor.id }, { transaction });
    await audit.record({ actorId: actor.id, action: 'TURNO_CREADO', resource: 'turno', resourceId: row.id, metadata: { pacienteId: data.pacienteId, prestadorId: data.prestadorId, servicioId: data.servicioId, consultorioId: data.consultorioId }, context: auth.context(req), transaction });
    await row.reload({ include: detailInclude, transaction }); return detail(row, actor);
  }); } catch (error) { return translateConflict(error); }
};

const transition = (actor, id, action, req, motivo) => sequelize.transaction(async (transaction) => {
  if (action === 'cancelar' && !motivo) fail('MOTIVO_CANCELACION_REQUERIDO', 'El motivo de cancelación es obligatorio.', 422);
  const row = await requireTurn(actor, id, { transaction, lock: transaction.LOCK.UPDATE }); const allowed = { confirmar: ['pendiente'], cancelar: ['pendiente', 'confirmado'], completar: ['confirmado'], ausente: ['confirmado'] };
  if (!allowed[action].includes(row.estado)) fail('TURNO_TRANSICION_INVALIDA', 'La transición no está permitida.', 409);
  if (['completar', 'ausente'].includes(action) && row.inicioAt > new Date()) fail('TURNO_AUN_NO_COMENZO', 'El turno todavía no comenzó.', 422);
  const next = { confirmar: 'confirmado', cancelar: 'cancelado', completar: 'completado', ausente: 'ausente' }[action]; const changes = { estado: next };
  if (action === 'cancelar') Object.assign(changes, { motivoCancelacion: motivo, canceladoAt: new Date(), canceladoPor: actor.id });
  await row.update(changes, { transaction }); await audit.record({ actorId: actor.id, action: `TURNO_${next.toUpperCase()}`, resource: 'turno', resourceId: id, metadata: { estadoAnterior: row.previous('estado'), estadoNuevo: next }, context: auth.context(req), transaction }); await row.reload({ include: detailInclude, transaction }); return detail(row, actor);
});
const updateNote = (actor, id, field, value, req) => sequelize.transaction(async (transaction) => { const row = await requireTurn(actor, id, { transaction, lock: transaction.LOCK.UPDATE }); if (TERMINAL_STATES.includes(row.estado)) fail('TURNO_TERMINAL_INMUTABLE', 'El turno terminal es inmutable.', 409); if (field === 'notasInternas' && !policy.canSeeInternal(actor, row)) fail('TURNO_NOTAS_INTERNAS_DENEGADAS', 'No podés modificar notas internas.', 403); await row.update({ [field]: value || null }, { transaction }); await audit.record({ actorId: actor.id, action: field === 'notasInternas' ? 'TURNO_NOTA_INTERNA_EDITADA' : 'TURNO_OBSERVACION_EDITADA', resource: 'turno', resourceId: id, context: auth.context(req), transaction }); await row.reload({ include: detailInclude, transaction }); return detail(row, actor); });

module.exports = { list, availability, get: async (actor, id) => detail(await requireTurn(actor, id), actor), create, transition, updateNote, event, detail, interval };
