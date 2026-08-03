/** Comparte categorías de roles usadas al decidir quién gestiona o recibe vínculos. */
const GLOBAL_ROLES = Object.freeze(['administrador', 'coordinacion', 'secretaria']);
const PROVIDER_ROLES = Object.freeze(['coordinacion', 'profesional']);

module.exports = { GLOBAL_ROLES, PROVIDER_ROLES };
