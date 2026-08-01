'use strict';

const asuntos = [['informe', 'Informe'], ['acuerdo', 'Acuerdo'], ['administrativo', 'Administrativo'], ['consulta', 'Consulta'], ['otro', 'Otro']];

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('asuntos', asuntos.map(([codigo, nombre]) => ({ codigo, nombre, activo: true, created_at: now, updated_at: now })), { ignoreDuplicates: true });
  },
  async down(queryInterface) { await queryInterface.bulkDelete('asuntos', { codigo: asuntos.map(([codigo]) => codigo) }); }
};
