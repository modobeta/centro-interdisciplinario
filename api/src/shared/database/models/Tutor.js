const { DataTypes, Model } = require('sequelize');

class Tutor extends Model {}
module.exports = (sequelize) => Tutor.init({
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 }, pacienteId: { type: DataTypes.UUID, allowNull: false, field: 'paciente_id' },
  nombre: { type: DataTypes.STRING(100), allowNull: false }, apellido: { type: DataTypes.STRING(100), allowNull: false }, telefono: { type: DataTypes.STRING(40), allowNull: false },
  parentesco: { type: DataTypes.STRING(80), allowNull: false }, email: DataTypes.STRING(254), direccion: DataTypes.STRING(255), observaciones: DataTypes.TEXT
}, { sequelize, modelName: 'Tutor', tableName: 'tutores', underscored: true, timestamps: true });
