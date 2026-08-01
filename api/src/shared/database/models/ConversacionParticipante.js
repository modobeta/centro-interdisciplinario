const { DataTypes, Model } = require('sequelize');

class ConversacionParticipante extends Model {}
module.exports = (sequelize) => ConversacionParticipante.init({
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 }, conversacionId: { type: DataTypes.UUID, allowNull: false, field: 'conversacion_id' },
  usuarioId: { type: DataTypes.UUID, allowNull: false, field: 'usuario_id' }, ultimoMensajeLeidoId: { type: DataTypes.UUID, field: 'ultimo_mensaje_leido_id' },
  ultimaLecturaAt: { type: DataTypes.DATE, field: 'ultima_lectura_at' }, archivadoAt: { type: DataTypes.DATE, field: 'archivado_at' },
  agregadoPor: { type: DataTypes.UUID, field: 'agregado_por' }, joinedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'joined_at' }
}, { sequelize, modelName: 'ConversacionParticipante', tableName: 'conversaciones_participantes', underscored: true, timestamps: false });
