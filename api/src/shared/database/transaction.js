/** Ejecuta casos de uso dentro de una transacción común y permite reutilizar una ya iniciada. */
const { sequelize } = require('./models');

/**
 * Ejecuta un trabajo usando la conexión compartida para que todas sus escrituras confirmen o reviertan juntas.
 * @param {(transaction: import('sequelize').Transaction) => Promise<*>} work Trabajo que recibirá la transacción activa.
 * @param {object} [options] Opciones admitidas por Sequelize para aislamiento o tipo de transacción.
 * @returns {Promise<*>} El resultado devuelto por el trabajo después del commit.
 */
module.exports = (work, options = {}) => sequelize.transaction(options, work);
