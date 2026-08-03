/** Distingue acceso global de acceso profesional limitado por vínculos activos. */
const isGlobal = (actor) => ['administrador', 'coordinacion', 'secretaria'].includes(actor?.rol); const isProfessional = (actor) => actor?.rol === 'profesional'; module.exports = { isGlobal, isProfessional };
