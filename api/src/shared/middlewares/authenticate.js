/** Verifica token, sesión y usuario en cada solicitud privada para que una revocación sea inmediata. */
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const AppError = require('../errors/AppError');
const { Sesion, Usuario, Rol } = require('../database/models');

module.exports = async (req, _res, next) => {
  try {
    const authorization = req.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) throw new AppError({ code: 'AUTHENTICATION_REQUIRED', message: 'Necesitás iniciar sesión.', status: 401 });
    let payload;
    try { payload = jwt.verify(authorization.slice(7), env.jwt.secret, { issuer: env.jwt.issuer, audience: env.jwt.audience }); }
    catch (error) {
      const expired = error.name === 'TokenExpiredError';
      throw new AppError({ code: expired ? 'TOKEN_EXPIRADO' : 'TOKEN_INVALIDO', message: 'El token de acceso no es válido.', status: 401 });
    }
    const session = await Sesion.findByPk(payload.sid, { include: [{ model: Usuario, as: 'usuario', include: [{ model: Rol, as: 'rol', attributes: ['codigo'] }] }] });
    if (!session || session.usuarioId !== payload.sub || session.revokedAt) throw new AppError({ code: 'SESION_REVOCADA', message: 'La sesión ya no está activa.', status: 401 });
    if (session.expiresAt <= new Date()) throw new AppError({ code: 'SESION_EXPIRADA', message: 'La sesión expiró.', status: 401 });
    if (!session.usuario?.activo) throw new AppError({ code: 'USUARIO_INACTIVO', message: 'El usuario está inactivo.', status: 401 });
    req.actor = { id: session.usuario.id, sessionId: session.id, rol: session.usuario.rol.codigo, user: session.usuario };
    next();
  } catch (error) { next(error); }
};
