const { DataTypes, Model } = require('sequelize');

class Servicio extends Model {}
module.exports = (sequelize) => Servicio.init({
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 }, nombre: { type: DataTypes.STRING(150), allowNull: false },
  descripcion: { type: DataTypes.TEXT, allowNull: false }, imagenUrl: { type: DataTypes.TEXT, field: 'imagen_url' },
  visiblePublicamente: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'visible_publicamente' },
  ordenPublico: { type: DataTypes.INTEGER, field: 'orden_publico' }, activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, { sequelize, modelName: 'Servicio', tableName: 'servicios', underscored: true, timestamps: true });
