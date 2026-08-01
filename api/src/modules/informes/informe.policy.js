const GLOBAL_READERS = new Set(['administrador', 'coordinacion', 'secretaria']);
const canReadAll = (actor) => GLOBAL_READERS.has(actor.rol);
const canCreateAny = (actor) => actor.rol === 'coordinacion';
const isAuthor = (actor, report) => actor.id === report.autorId;
module.exports = { canReadAll, canCreateAny, isAuthor };
