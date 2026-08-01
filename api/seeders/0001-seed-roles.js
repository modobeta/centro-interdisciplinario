'use strict';

const roles = [
  ['administrador', 'Administrador', 'Gestiona accesos, catálogos y auditoría.'],
  ['coordinacion', 'Coordinación', 'Coordina la operación y puede actuar como prestador.'],
  ['secretaria', 'Secretaría', 'Gestiona pacientes, vínculos y agenda.'],
  ['profesional', 'Profesional', 'Opera sobre pacientes vinculados y agenda propia.']
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('roles', roles.map(([codigo, nombre, descripcion]) => ({ codigo, nombre, descripcion, created_at: now, updated_at: now })), { ignoreDuplicates: true });
  },
  async down(queryInterface) { await queryInterface.bulkDelete('roles', { codigo: roles.map(([codigo]) => codigo) }); }
};
