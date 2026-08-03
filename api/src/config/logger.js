/** Configura logs estructurados y oculta campos sensibles antes de que lleguen a la salida. */
const pino = require('pino');
const env = require('./env');

const transport = !env.isProduction && !env.isTest
  ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' } }
  : undefined;

const logger = pino({
  level: env.logLevel,
  transport,
  serializers: {
    err: (error) => ({ type: error?.name || 'Error', code: error?.code || error?.parent?.code || 'UNKNOWN' })
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers.set-cookie',
      '*.password',
      '*.passwordHash',
      '*.dni',
      '*.accessToken',
      '*.refreshToken',
      '*.contenido',
      '*.diagnostico',
      '*.notasInternas'
    ],
    censor: '[REDACTED]'
  }
});

module.exports = logger;
