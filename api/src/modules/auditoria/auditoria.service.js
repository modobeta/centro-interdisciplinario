/** Registra eventos junto con el caso de uso y sanitiza metadata antes de persistirla. */
const { Op } = require('sequelize');
const logger = require('../../config/logger');
const { AuditoriaEvento, Usuario } = require('../../shared/database/models');
const { getPagination, paginationMeta } = require('../../shared/utils/pagination');
const events = require('./auditoria.events');
const { projectAuditEvent } = require('./auditoria.projection');

const ALLOWED_METADATA = new Set(['pacienteId', 'prestadorId', 'servicioId', 'consultorioId', 'tipoInformeId', 'conversacionId', 'estadoAnterior', 'estadoNuevo', 'campos', 'cantidad', 'tipoCatalogo', 'motivo', 'causa']);
const sanitizeMetadata = (metadata = {}) => Object.fromEntries(Object.entries(metadata).filter(([key]) => ALLOWED_METADATA.has(key)));

const record = async ({ actorId = null, action, resource, resourceId = null, result = 'exitoso', metadata = null, context = {}, transaction }) => {
  if (!events.includes(action)) throw new Error(`Evento de auditoría no aprobado: ${action}`);
  return AuditoriaEvento.create({
    usuarioId: actorId,
    accion: action,
    recurso: resource,
    recursoId: resourceId,
    resultado: result,
    metadata: metadata ? sanitizeMetadata(metadata) : null,
    ip: context.ip || null,
    userAgent: context.userAgent?.slice(0, 500) || null,
    correlationId: context.correlationId
  }, { transaction });
};

const recordFailureBestEffort = async (payload) => {
  try { await record({ ...payload, result: 'fallido' }); }
  catch (error) { logger.warn({ err: error, action: payload.action, correlationId: payload.context?.correlationId }, 'No se pudo registrar auditoría fallida'); }
};

const list = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};
  for (const field of ['usuarioId', 'accion', 'recurso', 'recursoId', 'resultado', 'correlationId']) if (query[field]) where[field] = query[field];
  if (query.desde || query.hasta) where.createdAt = { ...(query.desde ? { [Op.gte]: query.desde } : {}), ...(query.hasta ? { [Op.lt]: query.hasta } : {}) };
  const { rows, count } = await AuditoriaEvento.findAndCountAll({
    where, limit, offset, distinct: true,
    include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'apellido'], required: false }],
    order: [['createdAt', query.order || 'DESC'], ['id', query.order || 'DESC']]
  });
  return { data: rows.map(projectAuditEvent), meta: paginationMeta({ page, limit, total: count }) };
};

module.exports = { record, recordFailureBestEffort, list, sanitizeMetadata };
