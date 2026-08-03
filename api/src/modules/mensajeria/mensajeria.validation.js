/** Limita tamaños, lotes y cursores para mantener mensajes y consultas controlados. */
const Joi = require('joi'); const uuid = Joi.string().uuid({ version: 'uuidv4' }); const id = { params: Joi.object({ id: uuid.required() }) };
module.exports = {
  unread: { query: Joi.object({ limit: Joi.number().integer().min(1).max(20).default(5) }) },
  list: { query: Joi.object({ page: Joi.number().integer().min(1).default(1), limit: Joi.number().integer().min(1).max(100).default(20), search: Joi.string().trim().max(200), asuntoId: uuid, pacienteId: uuid, archivada: Joi.boolean().default(false), soloNoLeidas: Joi.boolean(), sort: Joi.string().valid('updatedAt', 'createdAt', 'titulo').default('updatedAt'), order: Joi.string().valid('asc', 'desc').default('desc') }) },
  create: { body: Joi.object({ asuntoId: uuid.required(), pacienteId: uuid.allow(null), titulo: Joi.string().trim().min(1).max(200).required(), participanteIds: Joi.array().items(uuid.required()).unique().default([]), mensajeInicial: Joi.string().trim().min(1).max(4000).required() }).required() },
  id,
  messages: { ...id, query: Joi.object({ beforeCreatedAt: Joi.string().isoDate(), beforeId: uuid, limit: Joi.number().integer().min(1).max(100).default(30) }).and('beforeCreatedAt', 'beforeId') },
  send: { ...id, body: Joi.object({ contenido: Joi.string().trim().max(4000).allow(null, '') }).required() },
  addParticipants: { ...id, body: Joi.object({ usuarioIds: Joi.array().items(uuid.required()).min(1).unique().required() }).required() },
  read: { ...id, body: Joi.object({ ultimoMensajeLeidoId: uuid.required() }).required() }
};
