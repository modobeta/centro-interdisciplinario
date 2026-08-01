'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pacientes', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      dni: { type: Sequelize.STRING(20), allowNull: true }, nombre: { type: Sequelize.STRING(100), allowNull: false }, apellido: { type: Sequelize.STRING(100), allowNull: false },
      fecha_nacimiento: { type: Sequelize.DATEONLY, allowNull: false }, colegio: { type: Sequelize.STRING(200), allowNull: true }, diagnostico: { type: Sequelize.TEXT, allowNull: true },
      posee_cud: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false }, cud_fecha_vencimiento: { type: Sequelize.DATEONLY, allowNull: true },
      observaciones: { type: Sequelize.TEXT, allowNull: true }, activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }, updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });
    await queryInterface.sequelize.query('CREATE UNIQUE INDEX pacientes_dni_uq ON pacientes (dni) WHERE dni IS NOT NULL');
    await queryInterface.sequelize.query("ALTER TABLE pacientes ADD CONSTRAINT pacientes_cud_consistente_chk CHECK ((posee_cud = false AND cud_fecha_vencimiento IS NULL) OR (posee_cud = true AND cud_fecha_vencimiento IS NOT NULL))");
    await queryInterface.addIndex('pacientes', ['activo'], { name: 'pacientes_activo_idx' });
    await queryInterface.sequelize.query('CREATE INDEX pacientes_nombre_idx ON pacientes (lower(apellido), lower(nombre))');
    await queryInterface.addIndex('pacientes', ['fecha_nacimiento'], { name: 'pacientes_nacimiento_idx' });
  },
  async down(queryInterface) { await queryInterface.dropTable('pacientes'); }
};
