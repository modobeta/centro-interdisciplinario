const ROLES = Object.freeze({
  ADMIN: 'administrador',
  COORDINATION: 'coordinacion',
  SECRETARY: 'secretaria',
  PROFESSIONAL: 'profesional'
});

const PROVIDER_ROLES = Object.freeze([ROLES.COORDINATION, ROLES.PROFESSIONAL]);

module.exports = { ROLES, PROVIDER_ROLES };
