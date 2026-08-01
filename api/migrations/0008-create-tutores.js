'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tutores', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      paciente_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'pacientes', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      nombre: { type: Sequelize.STRING(100), allowNull: false }, apellido: { type: Sequelize.STRING(100), allowNull: false }, telefono: { type: Sequelize.STRING(40), allowNull: false },
      parentesco: { type: Sequelize.STRING(80), allowNull: false }, email: { type: Sequelize.STRING(254), allowNull: true }, direccion: { type: Sequelize.STRING(255), allowNull: true },
      observaciones: { type: Sequelize.TEXT, allowNull: true }, created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }, updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });
    await queryInterface.addConstraint('tutores', { fields: ['paciente_id'], type: 'unique', name: 'tutores_paciente_uq' });
  },
  async down(queryInterface) { await queryInterface.dropTable('tutores'); }
};
