const { GLOBAL_ROLES } = require('./vinculo.constants');

const isGlobal = (actor) => GLOBAL_ROLES.includes(actor.rol);
const canCreate = (actor, alreadyLinked) => isGlobal(actor) || (actor.rol === 'profesional' && alreadyLinked);

module.exports = { isGlobal, canCreate };
