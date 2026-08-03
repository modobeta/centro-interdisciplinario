/** Mapea eventos funcionales inmutables para consultar quién realizó acciones sensibles. */
const { DataTypes, Model } = require('sequelize');

class AuditoriaEvento extends Model {}
module.exports = (sequelize) => AuditoriaEvento.init({
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 }, usuarioId: { type: DataTypes.UUID, field: 'usuario_id' },
  accion: { type: DataTypes.STRING(80), allowNull: false }, recurso: { type: DataTypes.STRING(80), allowNull: false }, recursoId: { type: DataTypes.UUID, field: 'recurso_id' },
  resultado: { type: DataTypes.STRING(20), allowNull: false }, metadata: DataTypes.JSONB, ip: DataTypes.INET, userAgent: { type: DataTypes.STRING(500), field: 'user_agent' },
  correlationId: { type: DataTypes.UUID, allowNull: false, field: 'correlation_id' }, createdAt: { type: DataTypes.DATE, allowNull: false, field: 'created_at' }
}, { sequelize, modelName: 'AuditoriaEvento', tableName: 'auditoria_eventos', underscored: true, timestamps: true, updatedAt: false });
