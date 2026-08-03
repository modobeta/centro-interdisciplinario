/** Crea un registro funcional append-only para rastrear acciones sensibles sin guardar contenido. */
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('auditoria_eventos', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      usuario_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      accion: { type: Sequelize.STRING(80), allowNull: false }, recurso: { type: Sequelize.STRING(80), allowNull: false }, recurso_id: { type: Sequelize.UUID, allowNull: true },
      resultado: { type: Sequelize.STRING(20), allowNull: false }, metadata: { type: Sequelize.JSONB, allowNull: true }, ip: { type: Sequelize.INET, allowNull: true },
      user_agent: { type: Sequelize.STRING(500), allowNull: true }, correlation_id: { type: Sequelize.UUID, allowNull: false }, created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });
    await queryInterface.sequelize.query("ALTER TABLE auditoria_eventos ADD CONSTRAINT auditoria_resultado_chk CHECK (resultado IN ('exitoso','fallido'))");
    await queryInterface.sequelize.query('CREATE INDEX auditoria_usuario_fecha_idx ON auditoria_eventos (usuario_id, created_at DESC)');
    await queryInterface.sequelize.query('CREATE INDEX auditoria_recurso_fecha_idx ON auditoria_eventos (recurso, recurso_id, created_at DESC)');
    await queryInterface.sequelize.query('CREATE INDEX auditoria_accion_fecha_idx ON auditoria_eventos (accion, created_at DESC)');
    await queryInterface.addIndex('auditoria_eventos', ['correlation_id'], { name: 'auditoria_correlation_idx' });
    await queryInterface.sequelize.query('CREATE INDEX auditoria_created_at_idx ON auditoria_eventos (created_at DESC, id DESC)');
  },
  async down(queryInterface) { await queryInterface.dropTable('auditoria_eventos'); }
};
