'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Sopinstansis', 'name', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('Sopinstansis', 'desc', {
      type: Sequelize.STRING
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Sopinstansis', 'name');
    await queryInterface.removeColumn('Sopinstansis', 'desc');
  }
};
