const app = require('./app');
const fs = require('node:fs/promises');
const { constants: fsConstants } = require('node:fs');
const env = require('./config/env');
const logger = require('./config/logger');
const { sequelize } = require('./shared/database/models');

let server;
const shutdown = async (signal) => {
  logger.info({ signal }, 'Iniciando apagado controlado');
  const force = setTimeout(() => { logger.error('Apagado forzado por timeout'); process.exit(1); }, 10000).unref();
  if (server) await new Promise((resolve) => server.close(resolve));
  await sequelize.close();
  clearTimeout(force);
  process.exit(0);
};

const start = async () => {
  try {
    await fs.mkdir(env.upload.root, { recursive: true });
    await fs.access(env.upload.root, fsConstants.W_OK);
    await sequelize.authenticate();
    server = app.listen(env.port, () => logger.info({ port: env.port, environment: env.nodeEnv }, 'API iniciada'));
  } catch (error) {
    logger.fatal({ err: error }, 'No se pudo iniciar la API');
    process.exitCode = 1;
  }
};

process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (error) => logger.fatal({ err: error }, 'Promesa no controlada'));
process.on('uncaughtException', (error) => { logger.fatal({ err: error }, 'Excepción no controlada'); process.exit(1); });
start();
