const GLOBAL_ROLES = new Set(['administrador', 'coordinacion', 'secretaria']);
const isGlobal = (actor) => GLOBAL_ROLES.has(actor.rol);
const owns = (actor, turno) => actor.id === turno.prestadorId;
const canAccess = (actor, turno) => isGlobal(actor) || owns(actor, turno);
const canSeeInternal = (actor, turno) => actor.rol === 'coordinacion' || owns(actor, turno);
module.exports = { isGlobal, owns, canAccess, canSeeInternal };
