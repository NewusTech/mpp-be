'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Pengaduans', 'updated_by', {
      type: Sequelize.INTEGER
    });

    await queryInterface.addConstraint('Pengaduans', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'custom_fkey_updated_by01', 
      references: {
        table: 'Userinfos',
        field: 'id'
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Pengaduans', 'custom_fkey_updated_by01');

    await queryInterface.removeColumn('Pengaduans', 'updated_by');
  }
};
