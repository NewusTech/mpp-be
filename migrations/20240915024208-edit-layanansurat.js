'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Layanansurats', 'header', {
      type: Sequelize.TEXT
    });
    await queryInterface.changeColumn('Layanansurats', 'footer', {
      type: Sequelize.TEXT
    });
    await queryInterface.changeColumn('Layanansurats', 'body', {
      type: Sequelize.TEXT
    });
    await queryInterface.changeColumn('Layanansurats', 'nomor', {
      type: Sequelize.TEXT
    });
    await queryInterface.changeColumn('Layanansurats', 'perihal', {
      type: Sequelize.TEXT
    });
    await queryInterface.changeColumn('Layanansurats', 'catatan', {
      type: Sequelize.TEXT
    });
    await queryInterface.changeColumn('Layanansurats', 'tembusan', {
      type: Sequelize.TEXT
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Layanansurats', 'header');
    await queryInterface.removeColumn('Layanansurats', 'footer');
    await queryInterface.removeColumn('Layanansurats', 'body');
    await queryInterface.removeColumn('Layanansurats', 'nomor');
    await queryInterface.removeColumn('Layanansurats', 'perihal');
    await queryInterface.removeColumn('Layanansurats', 'catatan');
    await queryInterface.removeColumn('Layanansurats', 'tembusan');
  }
};
