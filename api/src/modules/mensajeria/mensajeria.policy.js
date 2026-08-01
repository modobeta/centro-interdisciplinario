const AppError = require('../../shared/errors/AppError');
const { ConversacionParticipante } = require('../../shared/database/models');
const requireParticipation = async (actor, conversationId, options = {}) => { const row = await ConversacionParticipante.findOne({ where: { conversacionId: conversationId, usuarioId: actor.id }, ...options }); if (!row) throw new AppError({ code: 'CONVERSACION_NO_ENCONTRADA', message: 'Conversación no encontrada.', status: 404 }); return row; };
module.exports = { requireParticipation };
