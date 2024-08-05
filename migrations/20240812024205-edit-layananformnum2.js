'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Layananformnums', 'updated_by', {
      type: Sequelize.INTEGER
    });

    await queryInterface.addConstraint('Layananformnums', {
      fields: ['updated_by'],
      type: 'foreign key',
      name: 'custom_fkey_updated_by02', 
      references: {
        table: 'Userinfos',
        field: 'id'
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Pengaduans', 'custom_fkey_updated_by02');

    await queryInterface.removeColumn('Layananformnums', 'updated_by');
  }
};
