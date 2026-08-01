const env = require('./env');

module.exports = {
  development: { use_env_variable: 'DATABASE_URL', dialect: 'postgres', logging: false },
  test: { use_env_variable: 'TEST_DATABASE_URL', dialect: 'postgres', logging: false },
  staging: { use_env_variable: 'DATABASE_URL', dialect: 'postgres', logging: false, dialectOptions: env.database.ssl ? { ssl: { require: true, rejectUnauthorized: false } } : {} },
  production: { use_env_variable: 'DATABASE_URL', dialect: 'postgres', logging: false, dialectOptions: env.database.ssl ? { ssl: { require: true, rejectUnauthorized: true } } : {} }
};
