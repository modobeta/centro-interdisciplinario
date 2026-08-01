const { DataTypes, Model } = require('sequelize');

class UsuarioServicio extends Model {}
module.exports = (sequelize) => UsuarioServicio.init({
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 }, usuarioId: { type: DataTypes.UUID, allowNull: false, field: 'usuario_id' },
  servicioId: { type: DataTypes.UUID, allowNull: false, field: 'servicio_id' }, asignadoPor: { type: DataTypes.UUID, field: 'asignado_por' }
}, { sequelize, modelName: 'UsuarioServicio', tableName: 'usuarios_servicios', underscored: true, timestamps: true, updatedAt: false });
