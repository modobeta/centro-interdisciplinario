const env = require('../../config/env');
const AppError = require('../errors/AppError');

module.exports = (req, _res, next) => {
  const origin = req.get('Origin');
  if ((!origin && !env.isProduction) || (origin && env.corsOrigins.includes(origin))) {
    next();
    return;
  }
  next(new AppError({ code: 'FORBIDDEN', message: 'Origen no permitido.', status: 403 }));
};
