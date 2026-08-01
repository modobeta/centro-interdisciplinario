const path = require('node:path');
const dotenv = require('dotenv');
const Joi = require('joi');

dotenv.config({ quiet: true });

const boolean = Joi.boolean().truthy('true').falsy('false');
const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'staging', 'production').default('development'),
  PORT: Joi.number().integer().min(1).max(65535).default(3000),
  APP_TIME_ZONE: Joi.string().valid('America/Argentina/Cordoba').default('America/Argentina/Cordoba'),
  TRUST_PROXY: Joi.alternatives().try(boolean, Joi.number().integer().min(0)).default(false),
  DATABASE_URL: Joi.string().uri({ scheme: ['postgres', 'postgresql'] }).when('NODE_ENV', {
    is: 'test',
    then: Joi.optional(),
    otherwise: Joi.required()
  }),
  TEST_DATABASE_URL: Joi.string().uri({ scheme: ['postgres', 'postgresql'] }).when('NODE_ENV', {
    is: 'test',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  DB_POOL_MIN: Joi.number().integer().min(0).default(0),
  DB_POOL_MAX: Joi.number().integer().min(1).default(10),
  DB_POOL_IDLE_MS: Joi.number().integer().min(1000).default(10000),
  DB_POOL_ACQUIRE_MS: Joi.number().integer().min(1000).default(30000),
  DB_SSL: boolean.default(false),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_ISSUER: Joi.string().max(100).default('centro-interdisciplinario-api'),
  JWT_AUDIENCE: Joi.string().max(100).default('centro-interdisciplinario-client'),
  ACCESS_TOKEN_TTL: Joi.string().pattern(/^\d+[smhd]$/).default('15m'),
  REFRESH_TOKEN_TTL_DAYS: Joi.number().integer().min(1).max(30).default(7),
  REFRESH_COOKIE_NAME: Joi.string().pattern(/^[A-Za-z0-9_-]+$/).default('refreshToken'),
  COOKIE_SECURE: boolean.default(false),
  COOKIE_SAME_SITE: Joi.string().lowercase().valid('lax', 'strict', 'none').default('lax'),
  BCRYPT_ROUNDS: Joi.number().integer().min(10).max(15).default(12),
  CORS_ORIGINS: Joi.string().required(),
  JSON_BODY_LIMIT: Joi.string().pattern(/^\d+(kb|mb)$/i).default('1mb'),
  GLOBAL_RATE_LIMIT_WINDOW_MS: Joi.number().integer().min(1000).default(900000),
  GLOBAL_RATE_LIMIT_MAX: Joi.number().integer().min(1).default(300),
  LOGIN_RATE_LIMIT_WINDOW_MS: Joi.number().integer().min(1000).default(900000),
  LOGIN_RATE_LIMIT_MAX: Joi.number().integer().min(1).default(5),
  REFRESH_RATE_LIMIT_WINDOW_MS: Joi.number().integer().min(1000).default(900000),
  REFRESH_RATE_LIMIT_MAX: Joi.number().integer().min(1).default(30),
  LOG_LEVEL: Joi.string().valid('fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent').default('info'),
  UPLOAD_ROOT: Joi.string().default('uploads'),
  UPLOAD_MAX_BYTES: Joi.number().integer().min(1024).max(10 * 1024 * 1024).default(5 * 1024 * 1024),
  ADMIN_NOMBRE: Joi.string().trim().max(100), ADMIN_APELLIDO: Joi.string().trim().max(100), ADMIN_DNI: Joi.string().max(20), ADMIN_EMAIL: Joi.string().email()
}).unknown(true);

const { value, error } = schema.validate(process.env, { abortEarly: false, convert: true });

if (error) {
  throw new Error(`Configuración inválida: ${error.details.map((detail) => detail.message).join('; ')}`);
}

if (value.NODE_ENV === 'production' && !value.COOKIE_SECURE) {
  throw new Error('Configuración inválida: COOKIE_SECURE debe ser true en producción.');
}

if (value.COOKIE_SAME_SITE === 'none' && !value.COOKIE_SECURE) {
  throw new Error('Configuración inválida: SameSite=None requiere COOKIE_SECURE=true.');
}

const corsOrigins = value.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean);
if (!corsOrigins.length || corsOrigins.some((origin) => {
  try { const parsed = new URL(origin); return !['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== origin; } catch { return true; }
})) throw new Error('Configuración inválida: CORS_ORIGINS debe contener orígenes HTTP(S) absolutos.');
if (value.NODE_ENV === 'production' && corsOrigins.includes('*')) {
  throw new Error('Configuración inválida: CORS no admite wildcard en producción.');
}

const uploadRoot = path.resolve(process.cwd(), value.UPLOAD_ROOT);

module.exports = Object.freeze({
  nodeEnv: value.NODE_ENV,
  isProduction: value.NODE_ENV === 'production',
  isTest: value.NODE_ENV === 'test',
  port: value.PORT,
  timeZone: value.APP_TIME_ZONE,
  trustProxy: value.TRUST_PROXY,
  databaseUrl: value.NODE_ENV === 'test' ? value.TEST_DATABASE_URL : value.DATABASE_URL,
  database: Object.freeze({
    pool: Object.freeze({ min: value.DB_POOL_MIN, max: value.DB_POOL_MAX, idle: value.DB_POOL_IDLE_MS, acquire: value.DB_POOL_ACQUIRE_MS }),
    ssl: value.DB_SSL
  }),
  jwt: Object.freeze({ secret: value.JWT_ACCESS_SECRET, issuer: value.JWT_ISSUER, audience: value.JWT_AUDIENCE, accessTtl: value.ACCESS_TOKEN_TTL }),
  refresh: Object.freeze({ ttlDays: value.REFRESH_TOKEN_TTL_DAYS, cookieName: value.REFRESH_COOKIE_NAME }),
  cookie: Object.freeze({ secure: value.COOKIE_SECURE, sameSite: value.COOKIE_SAME_SITE }),
  bcryptRounds: value.BCRYPT_ROUNDS,
  corsOrigins: Object.freeze(corsOrigins),
  jsonBodyLimit: value.JSON_BODY_LIMIT,
  rateLimit: Object.freeze({
    global: Object.freeze({ windowMs: value.GLOBAL_RATE_LIMIT_WINDOW_MS, max: value.GLOBAL_RATE_LIMIT_MAX }),
    login: Object.freeze({ windowMs: value.LOGIN_RATE_LIMIT_WINDOW_MS, max: value.LOGIN_RATE_LIMIT_MAX }),
    refresh: Object.freeze({ windowMs: value.REFRESH_RATE_LIMIT_WINDOW_MS, max: value.REFRESH_RATE_LIMIT_MAX })
  }),
  logLevel: value.LOG_LEVEL,
  upload: Object.freeze({ root: uploadRoot, maxBytes: value.UPLOAD_MAX_BYTES }),
  admin: Object.freeze({ nombre: value.ADMIN_NOMBRE, apellido: value.ADMIN_APELLIDO, dni: value.ADMIN_DNI, email: value.ADMIN_EMAIL })
});
