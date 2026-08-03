/** Crea sesiones revocables y guarda sólo hashes para reducir el impacto de una filtración. */
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sesiones', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      usuario_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      refresh_token_hash: { type: Sequelize.BLOB, allowNull: false }, previous_refresh_token_hash: { type: Sequelize.BLOB, allowNull: true },
      expires_at: { type: Sequelize.DATE, allowNull: false }, revoked_at: { type: Sequelize.DATE, allowNull: true }, last_used_at: { type: Sequelize.DATE, allowNull: true },
      ip: { type: Sequelize.INET, allowNull: true }, user_agent: { type: Sequelize.STRING(500), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }, updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });
    await queryInterface.addIndex('sesiones', ['refresh_token_hash'], { unique: true, name: 'sesiones_refresh_hash_uq' });
    await queryInterface.sequelize.query('CREATE INDEX sesiones_usuario_activas_idx ON sesiones (usuario_id, expires_at) WHERE revoked_at IS NULL');
  },
  async down(queryInterface) { await queryInterface.dropTable('sesiones'); }
};
