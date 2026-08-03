/** Expresa quién puede modificar prestaciones sin duplicar la decisión en cada operación. */
const canManageService = (actor) => actor?.rol === 'administrador'; module.exports = { canManageService };
