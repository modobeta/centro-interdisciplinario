const { DataTypes, Model } = require('sequelize');

class Informe extends Model {}
module.exports = (sequelize) => Informe.init({
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 }, pacienteId: { type: DataTypes.UUID, allowNull: false, field: 'paciente_id' },
  autorId: { type: DataTypes.UUID, allowNull: false, field: 'autor_id' }, tipoInformeId: { type: DataTypes.UUID, allowNull: false, field: 'tipo_informe_id' },
  titulo: { type: DataTypes.STRING(200), allowNull: false }, resumen: { type: DataTypes.TEXT, allowNull: false }, contenido: { type: DataTypes.TEXT, allowNull: false },
  estado: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'borrador' }, version: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  fechaEmision: { type: DataTypes.DATE, field: 'fecha_emision' }
}, { sequelize, modelName: 'Informe', tableName: 'informes', underscored: true, timestamps: true });
