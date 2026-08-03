/** Crea mensajes inmutables y el orden compuesto necesario para paginación por cursor. */
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mensajes', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      conversacion_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'conversaciones', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      remitente_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      contenido: { type: Sequelize.TEXT, allowNull: false }, created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });
    await queryInterface.sequelize.query('CREATE INDEX mensajes_conversacion_cursor_idx ON mensajes (conversacion_id, created_at DESC, id DESC)');
  },
  async down(queryInterface) { await queryInterface.dropTable('mensajes'); }
};
