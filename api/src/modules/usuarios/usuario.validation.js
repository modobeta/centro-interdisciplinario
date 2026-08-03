/** Valida perfiles completos porque una actualización reemplaza el estado editable del usuario. */
const Joi = require('joi');
const { normalizeDni } = require('../../shared/utils/sanitize');

const id = Joi.string().uuid().required();
const fields = {
  nombre: Joi.string().trim().max(100).required(), apellido: Joi.string().trim().max(100).required(),
  dni: Joi.string().custom((value) => normalizeDni(value)).pattern(/^\d{7,20}$/).required(), email: Joi.string().trim().lowercase().email().max(254).required(),
  rol: Joi.string().valid('administrador', 'coordinacion', 'secretaria', 'profesional').required(), titulo: Joi.string().trim().max(120).allow(null),
  especialidad: Joi.string().trim().max(150).allow(null), telefono: Joi.string().trim().max(40).allow(null), bio: Joi.string().trim().allow(null),
  funcionPublica: Joi.string().trim().max(150).allow(null), visiblePublicamente: Joi.boolean().default(false), ordenPublico: Joi.number().integer().min(0).allow(null)
};
const write = Joi.object(fields);

module.exports = {
  list: { query: Joi.object({ page: Joi.number().integer().min(1).default(1), limit: Joi.number().integer().min(1).max(100).default(20), search: Joi.string().trim().max(100), rol: Joi.string().valid('administrador', 'coordinacion', 'secretaria', 'profesional'), activo: Joi.boolean().default(true), projection: Joi.string().valid('selector', 'directory', 'administrative'), sort: Joi.string().valid('apellido', 'nombre', 'createdAt', 'updatedAt').default('apellido'), order: Joi.string().lowercase().valid('asc', 'desc').default('asc') }) },
  id: { params: Joi.object({ id }) }, create: { body: write }, update: { params: Joi.object({ id }), body: write },
  state: { params: Joi.object({ id }), body: Joi.object({ activo: Joi.boolean().required() }) },
  userServiceList: { params: Joi.object({ id }), query: Joi.object({ activo: Joi.boolean().default(true) }) },
  addService: { params: Joi.object({ id }), body: Joi.object({ servicioId: Joi.string().uuid().required() }) },
  removeService: { params: Joi.object({ id, servicioId: Joi.string().uuid().required() }) }
};
