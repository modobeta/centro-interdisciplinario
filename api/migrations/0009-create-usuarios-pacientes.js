/** Conserva el historial de vínculos entre prestadores y pacientes en lugar de borrarlo. */
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios_pacientes', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      usuario_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      paciente_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'pacientes', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true }, fecha_inicio: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }, fecha_fin: { type: Sequelize.DATE, allowNull: true },
      vinculado_por: { type: Sequelize.UUID, allowNull: true, references: { model: 'usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      desvinculado_por: { type: Sequelize.UUID, allowNull: true, references: { model: 'usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      motivo_desvinculacion: { type: Sequelize.STRING(500), allowNull: true }, created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }, updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });
    await queryInterface.sequelize.query('CREATE UNIQUE INDEX usuarios_pacientes_activo_uq ON usuarios_pacientes (usuario_id, paciente_id) WHERE activo = true');
    await queryInterface.sequelize.query('CREATE INDEX usuarios_pacientes_paciente_activo_idx ON usuarios_pacientes (paciente_id, usuario_id) WHERE activo = true');
    await queryInterface.sequelize.query("ALTER TABLE usuarios_pacientes ADD CONSTRAINT usuarios_pacientes_estado_chk CHECK ((activo = true AND fecha_fin IS NULL AND desvinculado_por IS NULL AND motivo_desvinculacion IS NULL) OR (activo = false AND fecha_fin IS NOT NULL AND motivo_desvinculacion IS NOT NULL))");
  },
  async down(queryInterface) { await queryInterface.dropTable('usuarios_pacientes'); }
};
