'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      rol_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'roles', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      nombre: { type: Sequelize.STRING(100), allowNull: false }, apellido: { type: Sequelize.STRING(100), allowNull: false },
      dni: { type: Sequelize.STRING(20), allowNull: false }, email: { type: Sequelize.STRING(254), allowNull: false },
      password_hash: { type: Sequelize.STRING(255), allowNull: false }, titulo: { type: Sequelize.STRING(120), allowNull: true },
      especialidad: { type: Sequelize.STRING(150), allowNull: true }, telefono: { type: Sequelize.STRING(40), allowNull: true },
      bio: { type: Sequelize.TEXT, allowNull: true }, foto_url: { type: Sequelize.TEXT, allowNull: true },
      funcion_publica: { type: Sequelize.STRING(150), allowNull: true }, visible_publicamente: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      orden_publico: { type: Sequelize.INTEGER, allowNull: true }, activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }, updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });
    await queryInterface.sequelize.query('CREATE UNIQUE INDEX usuarios_email_lower_uq ON usuarios (lower(email))');
    await queryInterface.addIndex('usuarios', ['dni'], { unique: true, name: 'usuarios_dni_uq' });
    await queryInterface.addIndex('usuarios', ['rol_id', 'activo'], { name: 'usuarios_rol_activo_idx' });
    await queryInterface.sequelize.query('CREATE INDEX usuarios_publicos_idx ON usuarios (orden_publico, apellido, nombre) WHERE activo = true AND visible_publicamente = true');
    await queryInterface.sequelize.query('ALTER TABLE usuarios ADD CONSTRAINT usuarios_orden_publico_chk CHECK (orden_publico IS NULL OR orden_publico >= 0)');
  },
  async down(queryInterface) { await queryInterface.dropTable('usuarios'); }
};
