/** Reúne reglas repetidas de catálogos para que cada módulo sólo declare sus diferencias reales. */
const { Op, UniqueConstraintError } = require('sequelize');
const AppError = require('../../shared/errors/AppError');
const { sequelize } = require('../../shared/database/models');
const { getPagination, paginationMeta } = require('../../shared/utils/pagination');
const audit = require('../auditoria/auditoria.service');
const auth = require('../auth/auth.service');
const appointmentLocks = require('../turnos/turno-locks.service');

/**
 * Construye operaciones CRUD coherentes para catálogos con estado, auditoría y paginación.
 * @param {object} config Modelo, nombres públicos, campos editables y protección opcional de turnos futuros.
 * @returns {object} Servicio listo para listar, consultar, crear, editar y cambiar estado.
 */
module.exports = ({ model, resource, notFoundCode, fields, searchFields = ['nombre'], futureTurnModel, futureTurnField, duplicateCode = 'CATALOGO_NOMBRE_DUPLICADO' }) => {
  const project = (row) => Object.fromEntries(['id', ...fields, 'activo', 'createdAt', 'updatedAt'].map((field) => [field, row[field]]));
  const requireOne = async (id, options = {}) => { const row = await model.findByPk(id, options); if (!row) throw new AppError({ code: notFoundCode, message: 'Recurso no encontrado.', status: 404 }); return row; };
  const list = async (actor, query) => {
    if (query.activo === false && actor.rol !== 'administrador') throw new AppError({ code: 'FORBIDDEN_FILTER', message: 'El filtro solicitado no está permitido.', status: 403 });
    const { page, limit, offset } = getPagination(query); const where = { activo: query.activo };
    if (query.search) where[Op.or] = searchFields.map((field) => ({ [field]: { [Op.iLike]: `%${query.search}%` } }));
    const { rows, count } = await model.findAndCountAll({ where, limit, offset, order: [[query.sort, query.order.toUpperCase()], ['id', 'ASC']] });
    return { data: rows.map(project), meta: paginationMeta({ page, limit, total: count }) };
  };
  const get = async (actor, id) => { const row = await requireOne(id); if (!row.activo && actor.rol !== 'administrador') throw new AppError({ code: notFoundCode, message: 'Recurso no encontrado.', status: 404 }); return project(row); };
  const translate = (error) => { if (error instanceof UniqueConstraintError) { const code = error.parent?.constraint?.includes('codigo') ? 'ASUNTO_CODIGO_DUPLICADO' : duplicateCode; throw new AppError({ code, message: 'Ya existe un catálogo con esos datos.', status: 409 }); } throw error; };
  const create = async (actor, data, req) => { try { return await sequelize.transaction(async (transaction) => { const row = await model.create(data, { transaction }); await audit.record({ actorId: actor.id, action: 'CATALOGO_CREADO', resource, resourceId: row.id, metadata: { tipoCatalogo: resource }, context: auth.context(req), transaction }); return project(row); }); } catch (error) { return translate(error); } };
  const update = async (actor, id, data, req) => { try { return await sequelize.transaction(async (transaction) => { const row = await requireOne(id, { transaction, lock: transaction.LOCK.UPDATE }); await row.update(data, { transaction }); await audit.record({ actorId: actor.id, action: 'CATALOGO_EDITADO', resource, resourceId: row.id, metadata: { tipoCatalogo: resource, campos: Object.keys(data) }, context: auth.context(req), transaction }); return project(row); }); } catch (error) { return translate(error); } };
  const changeState = async (actor, id, active, req) => sequelize.transaction(async (transaction) => { if (!active && futureTurnField) await appointmentLocks.lockRelatedTo(futureTurnField, id, transaction); const row = await requireOne(id, { transaction, lock: transaction.LOCK.UPDATE }); if (row.activo === active) throw new AppError({ code: 'CATALOGO_ESTADO_SIN_CAMBIOS', message: 'El catálogo ya posee ese estado.', status: 409 }); if (!active && futureTurnModel) { const count = await futureTurnModel.count({ where: { [futureTurnField]: id, estado: { [Op.in]: ['pendiente', 'confirmado'] }, inicioAt: { [Op.gt]: new Date() } }, transaction }); if (count) throw new AppError({ code: resource === 'servicio' ? 'SERVICIO_CON_TURNOS_FUTUROS' : 'CONSULTORIO_CON_TURNOS_FUTUROS', message: 'El catálogo tiene turnos futuros activos.', status: 409 }); } await row.update({ activo: active }, { transaction }); await audit.record({ actorId: actor.id, action: active ? 'CATALOGO_ACTIVADO' : 'CATALOGO_DESACTIVADO', resource, resourceId: row.id, metadata: { tipoCatalogo: resource }, context: auth.context(req), transaction }); return project(row); });
  return { list, get, create, update, changeState, requireOne, project };
};
