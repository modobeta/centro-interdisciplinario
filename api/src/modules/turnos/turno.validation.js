/** Normaliza intervalos y transiciones antes de consultar disponibilidad o bloquear recursos. */
const Joi = require('joi');
const uuid = Joi.string().uuid({ version: 'uuidv4' });
const pagination = { page: Joi.number().integer().min(1).default(1), limit: Joi.number().integer().min(1).max(100).default(20) };
const durations = Joi.number().integer().valid(30, 45, 60, 90, 120);
const id = { params: Joi.object({ id: uuid.required() }) };

module.exports = {
  list: { query: Joi.object({ ...pagination, desde: Joi.string().isoDate(), hasta: Joi.string().isoDate(), prestadorId: uuid, pacienteId: uuid, consultorioId: uuid, servicioId: uuid, estado: Joi.string().valid('pendiente', 'confirmado', 'completado', 'cancelado', 'ausente'), sort: Joi.string().valid('inicioAt', 'estado', 'createdAt').default('inicioAt'), order: Joi.string().valid('asc', 'desc').default('asc') }) },
  availability: { query: Joi.object({ fecha: Joi.string().isoDate().required(), prestadorId: uuid, consultorioId: uuid, duracionMinutos: durations.required() }).or('prestadorId', 'consultorioId') },
  id,
  create: { body: Joi.object({ pacienteId: uuid.required(), prestadorId: uuid.required(), servicioId: uuid.required(), consultorioId: uuid.required(), fecha: Joi.string().isoDate().required(), horaInicio: Joi.string().pattern(/^([01]\d|2[0-3]):[0-5]\d$/).required(), duracionMinutos: durations.required(), observacionAdministrativa: Joi.string().trim().max(2000).allow(null, ''), notasInternas: Joi.string().trim().max(4000).allow(null, '') }).required() },
  cancel: { ...id, body: Joi.object({ motivo: Joi.string().trim().max(500).allow(null, '') }).required() },
  administrativeNote: { ...id, body: Joi.object({ observacionAdministrativa: Joi.string().trim().max(2000).allow(null, '').required() }).required() },
  internalNote: { ...id, body: Joi.object({ notasInternas: Joi.string().trim().max(4000).allow(null, '').required() }).required() }
};
