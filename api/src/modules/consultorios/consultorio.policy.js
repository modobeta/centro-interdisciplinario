/** Expresa quién puede administrar espacios sin mezclar permisos con persistencia. */
const canManageConsultorio = (actor) => actor?.rol === 'administrador'; module.exports = { canManageConsultorio };
