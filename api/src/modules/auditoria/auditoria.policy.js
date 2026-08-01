const canReadAudit = (actor) => actor?.rol === 'administrador';
module.exports = { canReadAudit };
