'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('conversaciones', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      asunto_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'asuntos', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      paciente_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'pacientes', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      titulo: { type: Sequelize.STRING(200), allowNull: false }, creado_por: { type: Sequelize.UUID, allowNull: false, references: { model: 'usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }, updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });
    await queryInterface.addIndex('conversaciones', ['paciente_id'], { name: 'conversaciones_paciente_idx' });
    await queryInterface.addIndex('conversaciones', ['asunto_id'], { name: 'conversaciones_asunto_idx' });
    await queryInterface.sequelize.query('CREATE INDEX conversaciones_updated_at_idx ON conversaciones (updated_at DESC, id DESC)');
  },
  async down(queryInterface) { await queryInterface.dropTable('conversaciones'); }
};
