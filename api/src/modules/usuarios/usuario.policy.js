const { ROLES } = require('../../shared/constants/roles');

const assertNotSelf = (actor, userId, AppError) => {
  if (actor.id === userId) throw new AppError({ code: 'USUARIO_AUTOMODIFICACION_DENEGADA', message: 'No podés modificar tu propia cuenta desde administración.', status: 403 });
};
const canUseAdministrativeProjection = (actor) => actor.rol === ROLES.ADMIN;
module.exports = { assertNotSelf, canUseAdministrativeProjection };
