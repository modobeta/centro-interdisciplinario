const { Sequelize } = require('sequelize');
const env = require('../../config/env');

const sequelize = new Sequelize(env.databaseUrl, {
  dialect: 'postgres',
  logging: false,
  pool: env.database.pool,
  dialectOptions: env.database.ssl ? { ssl: { require: true, rejectUnauthorized: env.isProduction } } : {},
  define: { underscored: true, freezeTableName: true }
});

module.exports = sequelize;
