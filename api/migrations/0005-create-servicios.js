/** Crea el catálogo de prestaciones con estado operativo y publicación independientes. */
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('servicios', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      nombre: { type: Sequelize.STRING(150), allowNull: false }, descripcion: { type: Sequelize.TEXT, allowNull: false },
      imagen_url: { type: Sequelize.TEXT, allowNull: true }, visible_publicamente: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      orden_publico: { type: Sequelize.INTEGER, allowNull: true }, activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }, updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });
    await queryInterface.sequelize.query('CREATE UNIQUE INDEX servicios_nombre_lower_uq ON servicios (lower(nombre))');
    await queryInterface.sequelize.query('CREATE INDEX servicios_publicos_idx ON servicios (orden_publico, nombre) WHERE activo = true AND visible_publicamente = true');
    await queryInterface.sequelize.query('ALTER TABLE servicios ADD CONSTRAINT servicios_orden_publico_chk CHECK (orden_publico IS NULL OR orden_publico >= 0)');
  },
  async down(queryInterface) { await queryInterface.dropTable('servicios'); }
};
