/** Mantiene la consulta de auditoría reservada al rol que controla la operación del sistema. */
const canReadAudit = (actor) => actor?.rol === 'administrador';
module.exports = { canReadAudit };
