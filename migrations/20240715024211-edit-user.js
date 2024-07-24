'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'resetpasswordtoken', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('Users', 'resetpasswordexpires', {
      type: Sequelize.DATE
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'resetpasswordtoken');
    await queryInterface.removeColumn('Users', 'resetpasswordexpires');
  }
};
