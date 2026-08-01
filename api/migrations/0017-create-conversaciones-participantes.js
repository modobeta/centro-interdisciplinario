'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('conversaciones_participantes', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      conversacion_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'conversaciones', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      usuario_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      ultimo_mensaje_leido_id: { type: Sequelize.UUID, allowNull: true }, ultima_lectura_at: { type: Sequelize.DATE, allowNull: true }, archivado_at: { type: Sequelize.DATE, allowNull: true },
      agregado_por: { type: Sequelize.UUID, allowNull: true, references: { model: 'usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' }, joined_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });
    await queryInterface.addConstraint('conversaciones_participantes', { fields: ['conversacion_id', 'usuario_id'], type: 'unique', name: 'conversaciones_participantes_conversacion_usuario_uq' });
    await queryInterface.addIndex('conversaciones_participantes', ['usuario_id', 'archivado_at'], { name: 'conversaciones_participantes_usuario_idx' });
    await queryInterface.addIndex('conversaciones_participantes', ['conversacion_id'], { name: 'conversaciones_participantes_conversacion_idx' });
  },
  async down(queryInterface) { await queryInterface.dropTable('conversaciones_participantes'); }
};
