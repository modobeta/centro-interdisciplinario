/** Crea borradores clínicos versionados para detectar ediciones concurrentes y finalización. */
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('informes', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      paciente_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'pacientes', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      autor_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'usuarios', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      tipo_informe_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'tipos_informe', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      titulo: { type: Sequelize.STRING(200), allowNull: false }, resumen: { type: Sequelize.TEXT, allowNull: false }, contenido: { type: Sequelize.TEXT, allowNull: false },
      estado: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'borrador' }, version: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 }, fecha_emision: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }, updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('now') }
    });
    await queryInterface.sequelize.query("ALTER TABLE informes ADD CONSTRAINT informes_estado_chk CHECK (estado IN ('borrador','finalizado'))");
    await queryInterface.sequelize.query("ALTER TABLE informes ADD CONSTRAINT informes_emision_chk CHECK ((estado = 'borrador' AND fecha_emision IS NULL) OR (estado = 'finalizado' AND fecha_emision IS NOT NULL))");
    await queryInterface.sequelize.query('ALTER TABLE informes ADD CONSTRAINT informes_version_chk CHECK (version >= 1)');
    await queryInterface.addIndex('informes', ['paciente_id', 'created_at'], { name: 'informes_paciente_fecha_idx' });
    await queryInterface.addIndex('informes', ['autor_id', 'estado'], { name: 'informes_autor_estado_idx' });
    await queryInterface.addIndex('informes', ['tipo_informe_id'], { name: 'informes_tipo_idx' });
    await queryInterface.sequelize.query('CREATE INDEX informes_created_at_idx ON informes (created_at DESC, id DESC)');
    await queryInterface.sequelize.query('CREATE INDEX informes_fecha_emision_idx ON informes (fecha_emision DESC, id DESC) WHERE fecha_emision IS NOT NULL');
  },
  async down(queryInterface) { await queryInterface.dropTable('informes'); }
};
