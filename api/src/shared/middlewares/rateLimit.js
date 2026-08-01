const { createHash } = require('node:crypto');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const env = require('../../config/env');

const handler = (code, message) => (_req, res) => res.status(429).json({
  error: {
    code,
    message,
    details: [],
    correlationId: res.getHeader('X-Correlation-Id')
  }
});

const globalLimiter = rateLimit({
  ...env.rateLimit.global,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: handler('RATE_LIMIT_EXCEEDED', 'Se alcanzó el límite de solicitudes.')
});

const loginLimiter = rateLimit({
  ...env.rateLimit.login,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    return createHash('sha256').update(`${ipKeyGenerator(req.ip)}|${email}`).digest('hex');
  },
  handler: handler('LOGIN_LIMITE_EXCEDIDO', 'Demasiados intentos de inicio de sesión.')
});

const refreshLimiter = rateLimit({
  ...env.rateLimit.refresh,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: handler('RATE_LIMIT_EXCEEDED', 'Demasiados intentos de renovación.')
});

module.exports = { globalLimiter, loginLimiter, refreshLimiter };
