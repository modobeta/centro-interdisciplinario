'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS btree_gist');
  },
  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP EXTENSION IF EXISTS btree_gist');
    await queryInterface.sequelize.query('DROP EXTENSION IF EXISTS pgcrypto');
  }
};
