'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Visimisis', 'visi', {
      type: Sequelize.TEXT
    });
    await queryInterface.changeColumn('Visimisis', 'misi', {
      type: Sequelize.TEXT
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Visimisis', 'visi');
    await queryInterface.removeColumn('Visimisis', 'misi');
  }
};
