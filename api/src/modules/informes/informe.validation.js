const Joi = require('joi');
const uuid = Joi.string().uuid({ version: 'uuidv4' });
const id = { params: Joi.object({ id: uuid.required() }) };
const fields = { tipoInformeId: uuid.required(), titulo: Joi.string().trim().min(1).max(200).required(), resumen: Joi.string().trim().min(1).max(10000).required(), contenido: Joi.string().trim().min(1).max(100000).required() };
module.exports = {
  list: { query: Joi.object({ page: Joi.number().integer().min(1).default(1), limit: Joi.number().integer().min(1).max(100).default(20), search: Joi.string().trim().max(200), pacienteId: uuid, autorId: uuid, tipoInformeId: uuid, estado: Joi.string().valid('borrador', 'finalizado'), sort: Joi.string().valid('createdAt', 'updatedAt', 'fechaEmision', 'titulo').default('createdAt'), order: Joi.string().valid('asc', 'desc').default('desc') }) },
  id,
  create: { body: Joi.object({ pacienteId: uuid.required(), ...fields }).required() },
  update: { ...id, body: Joi.object({ ...fields, expectedVersion: Joi.number().integer().min(1).required() }).required() },
  finalize: { ...id, body: Joi.object({ expectedVersion: Joi.number().integer().min(1).required() }).required() }
};
