/** Asigna una correlación estable a cada solicitud para seguir errores entre capas y logs. */
const { randomUUID } = require('node:crypto');

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

module.exports = (req, res, next) => {
  const provided = req.get('X-Correlation-Id');
  req.correlationId = provided && UUID_PATTERN.test(provided) ? provided.toLowerCase() : randomUUID();
  res.set('X-Correlation-Id', req.correlationId);
  next();
};
