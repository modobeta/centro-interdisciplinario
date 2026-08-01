const AppError = require('../errors/AppError');

module.exports = (_req, _res, next) => next(new AppError({ code: 'NOT_FOUND', message: 'Ruta no encontrada.', status: 404 }));
