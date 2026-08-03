/** Detiene entradas inválidas antes del negocio y conserva sólo valores normalizados por Joi. */
const AppError = require('../errors/AppError');

const formatDetails = (details) => details.map((detail) => ({
  field: detail.path.join('.'),
  code: detail.type,
  message: detail.message
}));

/**
 * Crea un middleware que valida params, query y body y reemplaza cada sección por su versión normalizada.
 * @param {object} schemas Esquemas Joi organizados por ubicación de la solicitud.
 * @returns {import('express').RequestHandler} Middleware que continúa sólo con entradas válidas.
 */
const validate = (schemas) => (req, _res, next) => {
  const validated = {};
  for (const location of ['params', 'query', 'body']) {
    if (!schemas[location]) continue;
    const { value, error } = schemas[location].validate(req[location], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: false,
      convert: true
    });
    if (error) {
      next(new AppError({ code: 'VALIDATION_ERROR', message: 'Revisá los datos enviados.', status: 400, details: formatDetails(error.details) }));
      return;
    }
    validated[location] = value;
    req[location] = value;
  }
  req.validated = validated;
  next();
};

module.exports = validate;
