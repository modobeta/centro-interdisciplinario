/** Gestiona credenciales, JWT y rotación de refresh sin persistir secretos reutilizables. */
const { createHash, randomBytes, randomUUID, timingSafeEqual } = require('node:crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const env = require('../../config/env');
const AppError = require('../../shared/errors/AppError');
const { sequelize, Usuario, Rol, Sesion } = require('../../shared/database/models');
const { ROLE_PERMISSIONS } = require('../../shared/constants/permissions');
const { normalizeDni, normalizeEmail } = require('../../shared/utils/sanitize');
const audit = require('../auditoria/auditoria.service');

const DUMMY_HASH = '$2b$12$KIXQ4YQdQ9aXjR8xEU.4Ne6PjYGU2rT7QdkKQG8hX4G4vWjNvwcwC';
const digest = (secret) => createHash('sha256').update(secret).digest();
const equals = (left, right) => Buffer.isBuffer(left) && left.length === right.length && timingSafeEqual(left, right);
const context = (req) => ({ correlationId: req.correlationId, ip: req.ip, userAgent: req.get('user-agent') });

const userProjection = (user) => ({
  id: user.id, nombre: user.nombre, apellido: user.apellido, rol: user.rol.codigo, titulo: user.titulo,
  especialidad: user.especialidad, funcionPublica: user.funcionPublica, fotoUrl: user.fotoUrl
});

const signAccess = (user, sessionId) => jwt.sign({ sid: sessionId, role: user.rol.codigo }, env.jwt.secret, {
  subject: user.id, issuer: env.jwt.issuer, audience: env.jwt.audience, expiresIn: env.jwt.accessTtl
});

const makeRefresh = (sessionId) => {
  const secret = randomBytes(32).toString('base64url');
  return { token: `${sessionId}.${secret}`, hash: digest(secret) };
};

/**
 * Separa un refresh opaco y devuelve sólo el identificador y hash necesarios para compararlo.
 * @param {string} token Token recibido desde la cookie HttpOnly.
 * @returns {{sessionId: string, hash: Buffer}|null} Datos verificables o null si el formato no es seguro.
 */
const parseRefresh = (token) => {
  if (typeof token !== 'string') return null;
  const [sessionId, secret, extra] = token.split('.');
  if (extra || !/^[0-9a-f-]{36}$/i.test(sessionId || '') || !/^[A-Za-z0-9_-]{43}$/.test(secret || '')) return null;
  return { sessionId: sessionId.toLowerCase(), hash: digest(secret) };
};

const sessionResponse = (user, sessionId) => ({ accessToken: signAccess(user, sessionId), user: userProjection(user), permissions: ROLE_PERMISSIONS[user.rol.codigo] || [] });

/**
 * Valida correo y DNI, crea una sesión revocable y entrega el par access/refresh.
 * @param {{email: string, dni: string}} credentials Credenciales normalizadas por la validación HTTP.
 * @param {import('express').Request} req Solicitud usada para contexto y auditoría.
 * @returns {Promise<{data: object, refreshToken: string}>} Sesión pública y refresh que irá a la cookie.
 */
const login = async ({ email, dni }, req) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await Usuario.scope('withPassword').findOne({ where: { email: normalizedEmail }, include: [{ model: Rol, as: 'rol', attributes: ['codigo'] }] });
  const valid = await bcrypt.compare(normalizeDni(dni), user?.passwordHash || DUMMY_HASH);
  if (!user || !user.activo || !valid) {
    await audit.recordFailureBestEffort({ actorId: user?.id || null, action: 'LOGIN_FALLIDO', resource: 'sesion', context: context(req), metadata: { causa: 'credenciales_invalidas' } });
    throw new AppError({ code: 'CREDENCIALES_INVALIDAS', message: 'Las credenciales son inválidas.', status: 401 });
  }
  return sequelize.transaction(async (transaction) => {
    const expiresAt = new Date(Date.now() + env.refresh.ttlDays * 86400000);
    const sessionId = randomUUID();
    const refresh = makeRefresh(sessionId);
    const session = await Sesion.create({ id: sessionId, usuarioId: user.id, refreshTokenHash: refresh.hash, expiresAt, ip: req.ip, userAgent: req.get('user-agent')?.slice(0, 500) }, { transaction });
    await audit.record({ actorId: user.id, action: 'LOGIN_EXITOSO', resource: 'sesion', resourceId: session.id, context: context(req), transaction });
    return { data: sessionResponse(user, session.id), refreshToken: refresh.token };
  });
};

/**
 * Rota el refresh bajo bloqueo para detectar reutilización y renovaciones concurrentes.
 * @param {string} token Refresh actual recibido desde la cookie.
 * @param {import('express').Request} req Solicitud usada para contexto y auditoría.
 * @returns {Promise<{data: object, refreshToken: string}>} Nuevos tokens de la misma sesión.
 */
const refresh = async (token, req) => {
  const parsed = parseRefresh(token);
  if (!parsed) throw new AppError({ code: 'REFRESH_INVALIDO', message: 'La sesión no pudo renovarse.', status: 401 });
  const outcome = await sequelize.transaction(async (transaction) => {
    // PostgreSQL no permite FOR UPDATE sobre el lado opcional de un JOIN; se bloquea sólo la sesión que rota el token.
    const session = await Sesion.findByPk(parsed.sessionId, {
      include: [{ model: Usuario, as: 'usuario', include: [{ model: Rol, as: 'rol', attributes: ['codigo'] }] }],
      transaction, lock: { level: transaction.LOCK.UPDATE, of: Sesion }
    });
    if (!session) return { error: 'REFRESH_INVALIDO' };
    if (session.revokedAt) return { error: 'SESION_REVOCADA' };
    if (session.expiresAt <= new Date()) return { error: 'SESION_EXPIRADA' };
    if (!session.usuario?.activo) return { error: 'USUARIO_INACTIVO' };
    if (equals(session.previousRefreshTokenHash, parsed.hash)) {
      await session.update({ revokedAt: new Date() }, { transaction });
      return { error: 'REFRESH_REUTILIZADO' };
    }
    if (!equals(session.refreshTokenHash, parsed.hash)) return { error: 'REFRESH_INVALIDO' };
    const next = makeRefresh(session.id);
    await session.update({ previousRefreshTokenHash: session.refreshTokenHash, refreshTokenHash: next.hash, lastUsedAt: new Date() }, { transaction });
    await audit.record({ actorId: session.usuarioId, action: 'SESION_RENOVADA', resource: 'sesion', resourceId: session.id, context: context(req), transaction });
    return { data: sessionResponse(session.usuario, session.id), refreshToken: next.token };
  });
  if (outcome.error) throw new AppError({ code: outcome.error, message: 'La sesión no pudo renovarse.', status: 401 });
  return outcome;
};

const logout = async (actor, req, all = false) => sequelize.transaction(async (transaction) => {
  const where = all ? { usuarioId: actor.id, revokedAt: null } : { id: actor.sessionId, revokedAt: null };
  await Sesion.update({ revokedAt: new Date() }, { where, transaction });
  await audit.record({ actorId: actor.id, action: all ? 'LOGOUT_TODAS' : 'LOGOUT', resource: 'sesion', resourceId: all ? null : actor.sessionId, context: context(req), transaction });
});

const revokeUserSessions = (userId, transaction) => Sesion.update({ revokedAt: new Date() }, { where: { usuarioId: userId, revokedAt: { [Op.is]: null } }, transaction });

module.exports = { login, refresh, logout, revokeUserSessions, parseRefresh, context, userProjection };
