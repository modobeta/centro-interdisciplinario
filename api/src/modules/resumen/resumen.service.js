/** Calcula tarjetas distintas por rol para no ampliar el acceso mediante métricas agregadas. */
const { Op, QueryTypes } = require('sequelize');
const { DateTime } = require('luxon');
const env = require('../../config/env');
const { sequelize, Paciente, UsuarioPaciente, Turno, Informe, Usuario, Servicio, AuditoriaEvento } = require('../../shared/database/models');

const countUnreadConversations = async (userId) => {
  const [row] = await sequelize.query("SELECT count(DISTINCT cp.conversacion_id)::int AS count FROM conversaciones_participantes cp JOIN mensajes m ON m.conversacion_id = cp.conversacion_id AND m.remitente_id <> cp.usuario_id LEFT JOIN mensajes lm ON lm.id = cp.ultimo_mensaje_leido_id WHERE cp.usuario_id = :userId AND (lm.id IS NULL OR (m.created_at, m.id) > (lm.created_at, lm.id))", { replacements: { userId }, type: QueryTypes.SELECT });
  return row.count;
};
const getSummary = async (actor) => {
  const day = DateTime.now().setZone(env.timeZone); const start = day.startOf('day').toUTC().toJSDate(); const end = day.plus({ days: 1 }).startOf('day').toUTC().toJSDate();
  const linkedPatientIds = actor.rol === 'profesional' ? (await UsuarioPaciente.findAll({ where: { usuarioId: actor.id, activo: true }, attributes: ['pacienteId'] })).map((row) => row.pacienteId) : null;
  const cards = [];
  const add = (key, label, count) => cards.push({ key, label, count });
  add('patients', 'Pacientes activos', await Paciente.count({ where: { activo: true, ...(linkedPatientIds ? { id: { [Op.in]: linkedPatientIds } } : {}) } }));
  add('appointmentsToday', 'Turnos de hoy', await Turno.count({ where: { inicioAt: { [Op.gte]: start, [Op.lt]: end }, ...(actor.rol === 'profesional' ? { prestadorId: actor.id } : {}) } }));
  if (actor.rol === 'profesional') add('reportDrafts', 'Borradores', await Informe.count({ where: { autorId: actor.id, estado: 'borrador' } }));
  if (actor.rol === 'secretaria') add('pendingAppointments', 'Turnos pendientes', await Turno.count({ where: { estado: 'pendiente' } }));
  if (actor.rol === 'coordinacion') add('reports', 'Informes recientes', await Informe.count());
  add('unreadConversations', 'Conversaciones no leídas', await countUnreadConversations(actor.id));
  if (actor.rol !== 'profesional') { add('users', 'Usuarios activos', await Usuario.count({ where: { activo: true } })); add('services', 'Servicios activos', await Servicio.count({ where: { activo: true } })); }
  if (actor.rol === 'administrador') add('recentAuditEvents', 'Eventos recientes', await AuditoriaEvento.count({ where: { createdAt: { [Op.gte]: new Date(Date.now() - 86400000) } } }));
  return cards.slice(0, 6);
};
module.exports = { getSummary };
