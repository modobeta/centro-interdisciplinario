/** Exige al menos uno de los permisos declarados por la ruta antes de llegar al caso de uso. */
const AppError = require('../errors/AppError');
const { ROLE_PERMISSIONS } = require('../constants/permissions');

/**
 * Crea un middleware que acepta al actor cuando posee al menos uno de los permisos solicitados.
 * @param {...string} requiredPermissions Alternativas de permiso válidas para la ruta.
 * @returns {import('express').RequestHandler} Middleware de autorización por rol.
 */
module.exports = (...requiredPermissions) => (req, _res, next) => {
  const permissions = ROLE_PERMISSIONS[req.actor?.rol] || [];
  if (!requiredPermissions.some((permission) => permissions.includes(permission))) {
    next(new AppError({ code: 'FORBIDDEN', message: 'No tenés permiso para realizar esta acción.', status: 403 }));
    return;
  }
  next();
};
