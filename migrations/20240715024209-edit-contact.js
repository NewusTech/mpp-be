'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Contacts', 'website', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('Contacts', 'desc', {
      type: Sequelize.TEXT
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Contacts', 'website');
    await queryInterface.removeColumn('Contacts', 'desc');
  }
};
