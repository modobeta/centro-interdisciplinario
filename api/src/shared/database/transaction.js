const { sequelize } = require('./models');

module.exports = (work, options = {}) => sequelize.transaction(options, work);
