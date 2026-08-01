const { DataTypes, Model } = require('sequelize');

class Conversacion extends Model {}
module.exports = (sequelize) => Conversacion.init({
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 }, asuntoId: { type: DataTypes.UUID, allowNull: false, field: 'asunto_id' },
  pacienteId: { type: DataTypes.UUID, field: 'paciente_id' }, titulo: { type: DataTypes.STRING(200), allowNull: false }, creadoPor: { type: DataTypes.UUID, allowNull: false, field: 'creado_por' }
}, { sequelize, modelName: 'Conversacion', tableName: 'conversaciones', underscored: true, timestamps: true });
