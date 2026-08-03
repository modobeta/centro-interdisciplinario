/** Mapea el catálogo de temas de conversación sin duplicar sus reglas en mensajería. */
const { DataTypes, Model } = require('sequelize');

class Asunto extends Model {}
module.exports = (sequelize) => Asunto.init({
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 }, codigo: { type: DataTypes.STRING(40), allowNull: false },
  nombre: { type: DataTypes.STRING(100), allowNull: false }, activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, { sequelize, modelName: 'Asunto', tableName: 'asuntos', underscored: true, timestamps: true });
