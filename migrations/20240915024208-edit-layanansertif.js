'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Layanansertifs', 'header', {
      type: Sequelize.TEXT
    });
    await queryInterface.changeColumn('Layanansertifs', 'footer', {
      type: Sequelize.TEXT
    });
    await queryInterface.changeColumn('Layanansertifs', 'body', {
      type: Sequelize.TEXT
    });
    await queryInterface.changeColumn('Layanansertifs', 'nomor', {
      type: Sequelize.TEXT
    });
    await queryInterface.changeColumn('Layanansertifs', 'perihal', {
      type: Sequelize.TEXT
    });
    await queryInterface.changeColumn('Layanansertifs', 'catatan', {
      type: Sequelize.TEXT
    });
    await queryInterface.changeColumn('Layanansertifs', 'tembusan', {
      type: Sequelize.TEXT
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Layanansertifs', 'header');
    await queryInterface.removeColumn('Layanansertifs', 'footer');
    await queryInterface.removeColumn('Layanansertifs', 'body');
    await queryInterface.removeColumn('Layanansertifs', 'nomor');
    await queryInterface.removeColumn('Layanansertifs', 'perihal');
    await queryInterface.removeColumn('Layanansertifs', 'catatan');
    await queryInterface.removeColumn('Layanansertifs', 'tembusan');
  }
};
