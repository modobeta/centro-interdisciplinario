/** Protege catálogo, turnos futuros e imágenes mediante transacciones y compensación de archivos. */
const AppError = require('../../shared/errors/AppError');
const { sequelize, Servicio, Turno } = require('../../shared/database/models');
const factory = require('../catalogos/catalogo.service-factory');
const files = require('../../shared/files/file-storage.service');
const audit = require('../auditoria/auditoria.service');
const auth = require('../auth/auth.service');

const base = factory({ model: Servicio, resource: 'servicio', notFoundCode: 'SERVICIO_NO_ENCONTRADO', fields: ['nombre', 'descripcion', 'imagenUrl', 'visiblePublicamente', 'ordenPublico'], futureTurnModel: Turno, futureTurnField: 'servicioId' });
const validate = (data) => { if (!data.descripcion) throw new AppError({ code: 'SERVICIO_DESCRIPCION_REQUERIDA', message: 'La descripción es obligatoria.', status: 422 }); };
const create = (actor, data, req) => { validate(data); return base.create(actor, data, req); };
const update = (actor, id, data, req) => { validate(data); return base.update(actor, id, data, req); };
const setImage = async (actor, id, file, req) => { if (!file) throw new AppError({ code: 'IMAGEN_REQUERIDA', message: 'Debés adjuntar una imagen.', status: 422 }); const row = await base.requireOne(id); const url = await files.replaceImage({ bucket: 'servicios', buffer: file.buffer, previousUrl: row.imagenUrl, persist: (next) => sequelize.transaction(async (transaction) => { await row.update({ imagenUrl: next }, { transaction }); await audit.record({ actorId: actor.id, action: 'SERVICIO_IMAGEN_ACTUALIZADA', resource: 'servicio', resourceId: id, context: auth.context(req), transaction }); }) }); return url; };
const deleteImage = async (actor, id, req) => { const row = await base.requireOne(id); await files.deleteImage({ currentUrl: row.imagenUrl, persist: () => sequelize.transaction(async (transaction) => { await row.update({ imagenUrl: null }, { transaction }); await audit.record({ actorId: actor.id, action: 'SERVICIO_IMAGEN_ELIMINADA', resource: 'servicio', resourceId: id, context: auth.context(req), transaction }); }) }); };
module.exports = { ...base, create, update, setImage, deleteImage };
