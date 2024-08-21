'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Surveyformnums', 'name', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('Surveyformnums', 'email', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('Surveyformnums', 'telepon', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('Surveyformnums', 'alamat', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('Surveyformnums', 'pekerjaan', {
      type: Sequelize.STRING
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Surveyformnums', 'name');
    await queryInterface.removeColumn('Surveyformnums', 'email');
    await queryInterface.removeColumn('Surveyformnums', 'telepon');
    await queryInterface.removeColumn('Surveyformnums', 'alamat');
    await queryInterface.removeColumn('Surveyformnums', 'pekerjaan');
  }
};
