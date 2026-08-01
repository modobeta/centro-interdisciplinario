const { DataTypes, Model } = require('sequelize');

class UsuarioPaciente extends Model {}
module.exports = (sequelize) => UsuarioPaciente.init({
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 }, usuarioId: { type: DataTypes.UUID, allowNull: false, field: 'usuario_id' },
  pacienteId: { type: DataTypes.UUID, allowNull: false, field: 'paciente_id' }, activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  fechaInicio: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'fecha_inicio' }, fechaFin: { type: DataTypes.DATE, field: 'fecha_fin' },
  vinculadoPor: { type: DataTypes.UUID, field: 'vinculado_por' }, desvinculadoPor: { type: DataTypes.UUID, field: 'desvinculado_por' },
  motivoDesvinculacion: { type: DataTypes.STRING(500), field: 'motivo_desvinculacion' }
}, { sequelize, modelName: 'UsuarioPaciente', tableName: 'usuarios_pacientes', underscored: true, timestamps: true });
