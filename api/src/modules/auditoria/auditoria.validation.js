const Joi = require('joi');

module.exports = {
  list: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1), limit: Joi.number().integer().min(1).max(100).default(20),
      usuarioId: Joi.string().uuid(), accion: Joi.string().max(80), recurso: Joi.string().max(80), recursoId: Joi.string().uuid(),
      resultado: Joi.string().valid('exitoso', 'fallido'), desde: Joi.date().iso(), hasta: Joi.date().iso(), correlationId: Joi.string().uuid(),
      sort: Joi.string().valid('createdAt').default('createdAt'), order: Joi.string().lowercase().valid('asc', 'desc').default('desc')
    })
  }
};
