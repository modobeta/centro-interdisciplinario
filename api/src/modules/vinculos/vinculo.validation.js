/** Limita prestadores, filtros y motivos antes de modificar la vigencia de un vínculo. */
const Joi = require('joi');

const uuid = Joi.string().uuid({ version: 'uuidv4' });
const params = Joi.object({ pacienteId: uuid.required() });

module.exports = {
  list: {
    params,
    query: Joi.object({ activo: Joi.boolean().default(true), incluirHistorial: Joi.boolean().default(false) })
  },
  create: { params, body: Joi.object({ usuarioId: uuid.required() }).required() },
  unlink: {
    params: Joi.object({ pacienteId: uuid.required(), usuarioId: uuid.required() }),
    body: Joi.object({ motivo: Joi.string().trim().max(500).allow(null, '') }).required()
  }
};
