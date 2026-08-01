const env = require('./env');
const AppError = require('../shared/errors/AppError');

const corsOptions = {
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'X-Correlation-Id'],
  exposedHeaders: ['X-Correlation-Id'],
  origin(origin, callback) {
    if (!origin || env.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new AppError({ code: 'FORBIDDEN', message: 'Origen no permitido.', status: 403 }));
  }
};

module.exports = corsOptions;
