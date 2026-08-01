'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('consultorios', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') }, nombre: { type: Sequelize.STRING(120), allowNull: false },
      descripcion: { type: Sequelize.TEXT, allowNull: true }, ubicacion: { type: Sequelize.STRING(200), allowNull: true }, capacidad: { type: Sequelize.INTEGER, allowNull: true },
      activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true }, created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }, updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });
    await queryInterface.sequelize.query('CREATE UNIQUE INDEX consultorios_nombre_lower_uq ON consultorios (lower(nombre))');
    await queryInterface.sequelize.query('ALTER TABLE consultorios ADD CONSTRAINT consultorios_capacidad_chk CHECK (capacidad IS NULL OR capacidad > 0)');
  },
  async down(queryInterface) { await queryInterface.dropTable('consultorios'); }
};
