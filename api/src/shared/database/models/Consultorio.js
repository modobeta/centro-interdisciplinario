/** Mapea espacios reservables para que la agenda pueda comprobar disponibilidad física. */
const { DataTypes, Model } = require('sequelize');

class Consultorio extends Model {}
module.exports = (sequelize) => Consultorio.init({
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 }, nombre: { type: DataTypes.STRING(120), allowNull: false },
  descripcion: DataTypes.TEXT, ubicacion: DataTypes.STRING(200), capacidad: DataTypes.INTEGER, activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, { sequelize, modelName: 'Consultorio', tableName: 'consultorios', underscored: true, timestamps: true });
