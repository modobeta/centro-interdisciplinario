const AppError = require('../errors/AppError');
const { ROLE_PERMISSIONS } = require('../constants/permissions');

module.exports = (...requiredPermissions) => (req, _res, next) => {
  const permissions = ROLE_PERMISSIONS[req.actor?.rol] || [];
  if (!requiredPermissions.some((permission) => permissions.includes(permission))) {
    next(new AppError({ code: 'FORBIDDEN', message: 'No tenés permiso para realizar esta acción.', status: 403 }));
    return;
  }
  next();
};
