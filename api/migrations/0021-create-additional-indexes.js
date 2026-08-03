/** Agrega índices de consultas reales después de que todas las tablas y relaciones existen. */
'use strict';

module.exports = {
  async up(queryInterface) {
    const statements = [
      'CREATE INDEX usuarios_activo_nombre_idx ON usuarios (activo, apellido, nombre)',
      'CREATE INDEX servicios_activo_nombre_idx ON servicios (activo, nombre)',
      'CREATE INDEX consultorios_activo_nombre_idx ON consultorios (activo, nombre)',
      'CREATE INDEX tipos_informe_activo_nombre_idx ON tipos_informe (activo, nombre)',
      'CREATE INDEX asuntos_activo_nombre_idx ON asuntos (activo, nombre)',
      'CREATE INDEX usuarios_pacientes_usuario_activo_idx ON usuarios_pacientes (usuario_id, paciente_id) WHERE activo = true',
      'CREATE INDEX usuarios_pacientes_paciente_historial_idx ON usuarios_pacientes (paciente_id, fecha_inicio DESC, id DESC)',
      'CREATE INDEX informes_listado_global_idx ON informes (estado, updated_at DESC, id DESC)'
    ];
    for (const sql of statements) await queryInterface.sequelize.query(sql);
  },
  async down(queryInterface) {
    const indexes = [
      ['informes', 'informes_listado_global_idx'], ['usuarios_pacientes', 'usuarios_pacientes_paciente_historial_idx'],
      ['usuarios_pacientes', 'usuarios_pacientes_usuario_activo_idx'], ['asuntos', 'asuntos_activo_nombre_idx'],
      ['tipos_informe', 'tipos_informe_activo_nombre_idx'], ['consultorios', 'consultorios_activo_nombre_idx'],
      ['servicios', 'servicios_activo_nombre_idx'], ['usuarios', 'usuarios_activo_nombre_idx']
    ];
    for (const [table, name] of indexes) await queryInterface.removeIndex(table, name);
  }
};
