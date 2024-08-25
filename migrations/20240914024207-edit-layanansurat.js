'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Layanansurats', 'nomor', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('Layanansurats', 'perihal', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('Layanansurats', 'catatan', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('Layanansurats', 'tembusan', {
      type: Sequelize.STRING
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Layanansurats', 'nomor');
    await queryInterface.removeColumn('Layanansurats', 'perihal');
    await queryInterface.removeColumn('Layanansurats', 'catatan');
    await queryInterface.removeColumn('Layanansurats', 'tembusan');
  }
};
