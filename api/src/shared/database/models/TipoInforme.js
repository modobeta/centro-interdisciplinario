const { DataTypes, Model } = require('sequelize');

class TipoInforme extends Model {}
module.exports = (sequelize) => TipoInforme.init({
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 }, nombre: { type: DataTypes.STRING(150), allowNull: false },
  descripcion: DataTypes.TEXT, activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, { sequelize, modelName: 'TipoInforme', tableName: 'tipos_informe', underscored: true, timestamps: true });
