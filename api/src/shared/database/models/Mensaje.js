const { DataTypes, Model } = require('sequelize');

class Mensaje extends Model {}
module.exports = (sequelize) => Mensaje.init({
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 }, conversacionId: { type: DataTypes.UUID, allowNull: false, field: 'conversacion_id' },
  remitenteId: { type: DataTypes.UUID, allowNull: false, field: 'remitente_id' }, contenido: { type: DataTypes.TEXT, allowNull: false },
  createdAt: { type: DataTypes.DATE, allowNull: false, field: 'created_at' }
}, { sequelize, modelName: 'Mensaje', tableName: 'mensajes', underscored: true, timestamps: true, updatedAt: false });
