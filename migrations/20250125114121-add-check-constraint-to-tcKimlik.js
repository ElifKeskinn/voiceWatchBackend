'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE Users
      ADD CONSTRAINT check_tcKimlik_length
      CHECK (LEN(tcKimlik) = 11 AND tcKimlik NOT LIKE '%[^0-9]%')
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE Users
      DROP CONSTRAINT check_tcKimlik_length
    `);
  }
};
