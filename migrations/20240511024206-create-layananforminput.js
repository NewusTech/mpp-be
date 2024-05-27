'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Layananforminputs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      data: {
        type: Sequelize.STRING
      },
      layananform_id: {
        type: Sequelize.INTEGER
      },
      layananformnum_id: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addConstraint('Layananforminputs', {
      fields: ['layananform_id'],
      type: 'foreign key',
      name: 'custom_fkey_layananform_id',
      references: {
        table: 'Layananforms',
        field: 'id'
      }
    });

    await queryInterface.addConstraint('Layananforminputs', {
      fields: ['layananformnum_id'],
      type: 'foreign key',
      name: 'custom_fkey_layananformnum_id',
      references: {
        table: 'Layananformnums',
        field: 'id'
      }
    });
  },

  //untuk drop table ketika melakukan revert migrations
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Layananforminputs');
  }
};