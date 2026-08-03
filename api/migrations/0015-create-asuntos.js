/** Crea temas de conversación controlados para ordenar la mensajería institucional. */
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('asuntos', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') }, codigo: { type: Sequelize.STRING(40), allowNull: false },
      nombre: { type: Sequelize.STRING(100), allowNull: false }, activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }, updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });
    await queryInterface.sequelize.query("ALTER TABLE asuntos ADD CONSTRAINT asuntos_codigo_formato_chk CHECK (codigo ~ '^[a-z0-9_]{1,40}$')");
    await queryInterface.addIndex('asuntos', ['codigo'], { unique: true, name: 'asuntos_codigo_uq' });
    await queryInterface.sequelize.query('CREATE UNIQUE INDEX asuntos_nombre_lower_uq ON asuntos (lower(nombre))');
  },
  async down(queryInterface) { await queryInterface.dropTable('asuntos'); }
};
