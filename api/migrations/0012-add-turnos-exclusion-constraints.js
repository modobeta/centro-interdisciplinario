/** Impide solapamientos aun con solicitudes concurrentes, donde una validación en JS no alcanza. */
'use strict';

module.exports = {
  async up(queryInterface) {
    for (const [name, column] of [['turnos_prestador_no_overlap', 'prestador_id'], ['turnos_paciente_no_overlap', 'paciente_id'], ['turnos_consultorio_no_overlap', 'consultorio_id']]) {
      await queryInterface.sequelize.query(`ALTER TABLE turnos ADD CONSTRAINT ${name} EXCLUDE USING gist (${column} WITH =, tstzrange(inicio_at, fin_at, '[)') WITH &&) WHERE (estado IN ('pendiente','confirmado'))`);
    }
  },
  async down(queryInterface) {
    for (const name of ['turnos_consultorio_no_overlap', 'turnos_paciente_no_overlap', 'turnos_prestador_no_overlap']) await queryInterface.removeConstraint('turnos', name);
  }
};
