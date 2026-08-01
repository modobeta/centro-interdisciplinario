'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('turnos', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      paciente_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'pacientes', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      prestador_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      consultorio_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'consultorios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      servicio_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'servicios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      inicio_at: { type: Sequelize.DATE, allowNull: false }, fin_at: { type: Sequelize.DATE, allowNull: false }, duracion_minutos: { type: Sequelize.SMALLINT, allowNull: false },
      estado: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'pendiente' }, observacion_administrativa: { type: Sequelize.TEXT, allowNull: true }, notas_internas: { type: Sequelize.TEXT, allowNull: true },
      cancelado_at: { type: Sequelize.DATE, allowNull: true }, cancelado_por: { type: Sequelize.UUID, allowNull: true, references: { model: 'usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      motivo_cancelacion: { type: Sequelize.STRING(500), allowNull: true }, creado_por: { type: Sequelize.UUID, allowNull: true, references: { model: 'usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }, updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });
    await queryInterface.sequelize.query("ALTER TABLE turnos ADD CONSTRAINT turnos_estado_chk CHECK (estado IN ('pendiente','confirmado','completado','cancelado','ausente'))");
    await queryInterface.sequelize.query('ALTER TABLE turnos ADD CONSTRAINT turnos_duracion_chk CHECK (duracion_minutos IN (30,45,60,90,120))');
    await queryInterface.sequelize.query('ALTER TABLE turnos ADD CONSTRAINT turnos_intervalo_chk CHECK (fin_at > inicio_at)');
    await queryInterface.sequelize.query("ALTER TABLE turnos ADD CONSTRAINT turnos_duracion_intervalo_chk CHECK (fin_at = inicio_at + duracion_minutos * interval '1 minute')");
    await queryInterface.sequelize.query("ALTER TABLE turnos ADD CONSTRAINT turnos_cancelacion_chk CHECK ((estado = 'cancelado' AND cancelado_at IS NOT NULL AND cancelado_por IS NOT NULL AND motivo_cancelacion IS NOT NULL) OR (estado <> 'cancelado' AND cancelado_at IS NULL AND cancelado_por IS NULL AND motivo_cancelacion IS NULL))");
    for (const [fields, name] of [[['inicio_at'], 'turnos_inicio_idx'], [['prestador_id', 'inicio_at'], 'turnos_prestador_inicio_idx'], [['paciente_id', 'inicio_at'], 'turnos_paciente_inicio_idx'], [['consultorio_id', 'inicio_at'], 'turnos_consultorio_inicio_idx'], [['estado', 'inicio_at'], 'turnos_estado_inicio_idx'], [['servicio_id', 'inicio_at'], 'turnos_servicio_inicio_idx']]) await queryInterface.addIndex('turnos', fields, { name });
  },
  async down(queryInterface) { await queryInterface.dropTable('turnos'); }
};
