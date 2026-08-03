/** Mapea la ficha central del paciente, preservada aun cuando deja de estar activa. */
const { DataTypes, Model } = require('sequelize');

class Paciente extends Model {}
module.exports = (sequelize) => Paciente.init({
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 }, dni: DataTypes.STRING(20), nombre: { type: DataTypes.STRING(100), allowNull: false },
  apellido: { type: DataTypes.STRING(100), allowNull: false }, fechaNacimiento: { type: DataTypes.DATEONLY, allowNull: false, field: 'fecha_nacimiento' },
  colegio: DataTypes.STRING(200), diagnostico: DataTypes.TEXT, poseeCud: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'posee_cud' },
  cudFechaVencimiento: { type: DataTypes.DATEONLY, field: 'cud_fecha_vencimiento' }, observaciones: DataTypes.TEXT,
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, { sequelize, modelName: 'Paciente', tableName: 'pacientes', underscored: true, timestamps: true });
