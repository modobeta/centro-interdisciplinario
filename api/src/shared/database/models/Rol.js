/** Mapea roles persistidos para mantener permisos y usuarios sobre códigos estables. */
const { DataTypes, Model } = require('sequelize');

class Rol extends Model {}
module.exports = (sequelize) => Rol.init({
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 }, codigo: { type: DataTypes.STRING(30), allowNull: false },
  nombre: { type: DataTypes.STRING(80), allowNull: false }, descripcion: DataTypes.STRING(255)
}, { sequelize, modelName: 'Rol', tableName: 'roles', underscored: true, timestamps: true });
