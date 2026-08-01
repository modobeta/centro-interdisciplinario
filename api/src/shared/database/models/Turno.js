const { DataTypes, Model } = require('sequelize');

class Turno extends Model {}
module.exports = (sequelize) => Turno.init({
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 }, pacienteId: { type: DataTypes.UUID, allowNull: false, field: 'paciente_id' },
  prestadorId: { type: DataTypes.UUID, allowNull: false, field: 'prestador_id' }, consultorioId: { type: DataTypes.UUID, allowNull: false, field: 'consultorio_id' },
  servicioId: { type: DataTypes.UUID, allowNull: false, field: 'servicio_id' }, inicioAt: { type: DataTypes.DATE, allowNull: false, field: 'inicio_at' },
  finAt: { type: DataTypes.DATE, allowNull: false, field: 'fin_at' }, duracionMinutos: { type: DataTypes.SMALLINT, allowNull: false, field: 'duracion_minutos' },
  estado: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'pendiente' }, observacionAdministrativa: { type: DataTypes.TEXT, field: 'observacion_administrativa' },
  notasInternas: { type: DataTypes.TEXT, field: 'notas_internas' }, canceladoAt: { type: DataTypes.DATE, field: 'cancelado_at' },
  canceladoPor: { type: DataTypes.UUID, field: 'cancelado_por' }, motivoCancelacion: { type: DataTypes.STRING(500), field: 'motivo_cancelacion' }, creadoPor: { type: DataTypes.UUID, field: 'creado_por' }
}, { sequelize, modelName: 'Turno', tableName: 'turnos', underscored: true, timestamps: true });
