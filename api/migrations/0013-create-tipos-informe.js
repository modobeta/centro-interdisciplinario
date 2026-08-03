/** Crea tipos administrables para evitar guardar nombres libres e inconsistentes en informes. */
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tipos_informe', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') }, nombre: { type: Sequelize.STRING(150), allowNull: false },
      descripcion: { type: Sequelize.TEXT, allowNull: true }, activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }, updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });
    await queryInterface.sequelize.query('CREATE UNIQUE INDEX tipos_informe_nombre_lower_uq ON tipos_informe (lower(nombre))');
  },
  async down(queryInterface) { await queryInterface.dropTable('tipos_informe'); }
};
