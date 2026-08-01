'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios_servicios', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      usuario_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      servicio_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'servicios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      asignado_por: { type: Sequelize.UUID, allowNull: true, references: { model: 'usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });
    await queryInterface.addConstraint('usuarios_servicios', { fields: ['usuario_id', 'servicio_id'], type: 'unique', name: 'usuarios_servicios_usuario_servicio_uq' });
  },
  async down(queryInterface) { await queryInterface.dropTable('usuarios_servicios'); }
};
