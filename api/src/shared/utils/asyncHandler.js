/**
 * Envuelve un handler asíncrono porque Express necesita recibir el rechazo mediante next.
 * @param {import('express').RequestHandler} handler Handler que puede devolver una promesa.
 * @returns {import('express').RequestHandler} Handler compatible con el flujo de errores central.
 */
module.exports = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
