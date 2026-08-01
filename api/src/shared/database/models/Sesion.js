const { DataTypes, Model } = require('sequelize');

class Sesion extends Model {}
module.exports = (sequelize) => Sesion.init({
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 }, usuarioId: { type: DataTypes.UUID, allowNull: false, field: 'usuario_id' },
  refreshTokenHash: { type: DataTypes.BLOB, allowNull: false, field: 'refresh_token_hash' }, previousRefreshTokenHash: { type: DataTypes.BLOB, field: 'previous_refresh_token_hash' },
  expiresAt: { type: DataTypes.DATE, allowNull: false, field: 'expires_at' }, revokedAt: { type: DataTypes.DATE, field: 'revoked_at' },
  lastUsedAt: { type: DataTypes.DATE, field: 'last_used_at' }, ip: DataTypes.INET, userAgent: { type: DataTypes.STRING(500), field: 'user_agent' }
}, { sequelize, modelName: 'Sesion', tableName: 'sesiones', underscored: true, timestamps: true });
