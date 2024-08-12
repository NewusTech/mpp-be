'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Manualbooks', 'role_id', {
      type: Sequelize.INTEGER
    });

    await queryInterface.addConstraint('Manualbooks', {
      fields: ['role_id'],
      type: 'foreign key',
      name: 'custom_fkey_role_id',
      references: {
        table: 'Roles',
        field: 'id'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Manualbooks', 'custom_fkey_role_id');

    await queryInterface.removeColumn('Manualbooks', 'role_id');
  }
};
