const env = require('../../config/env');
const service = require('./auth.service');

const cookieBase = () => ({ httpOnly: true, secure: env.cookie.secure, sameSite: env.cookie.sameSite, path: '/api/v1/auth' });
const cookieOptions = () => ({ ...cookieBase(), maxAge: env.refresh.ttlDays * 86400000 });
const clearCookie = (res) => res.clearCookie(env.refresh.cookieName, cookieBase());

const login = async (req, res) => {
  const result = await service.login(req.body, req);
  res.cookie(env.refresh.cookieName, result.refreshToken, cookieOptions()).json({ data: result.data });
};
const refresh = async (req, res) => {
  const result = await service.refresh(req.cookies[env.refresh.cookieName], req);
  res.cookie(env.refresh.cookieName, result.refreshToken, cookieOptions()).json({ data: result.data });
};
const logout = async (req, res) => { await service.logout(req.actor, req); clearCookie(res); res.status(204).end(); };
const logoutAll = async (req, res) => { await service.logout(req.actor, req, true); clearCookie(res); res.status(204).end(); };

module.exports = { login, refresh, logout, logoutAll, cookieOptions };
