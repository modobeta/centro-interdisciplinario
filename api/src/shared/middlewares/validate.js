const AppError = require('../errors/AppError');

const formatDetails = (details) => details.map((detail) => ({
  field: detail.path.join('.'),
  code: detail.type,
  message: detail.message
}));

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
