'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Layanans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      slug: {
        type: Sequelize.STRING
      },
      desc: {
        type: Sequelize.TEXT
      },
      image: {
        type: Sequelize.STRING
      },
      active_online: {
        type: Sequelize.BOOLEAN
      },
      active_offline: {
        type: Sequelize.BOOLEAN
      },
      status: {
        type: Sequelize.BOOLEAN
      },
      instansi_id: {
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

    await queryInterface.addConstraint('Layanans', {
      fields: ['instansi_id'],
      type: 'foreign key',
      name: 'custom_fkey_instansi_id',
      references: {
        table: 'Instansis',
        field: 'id'
      }
    });
  },

  //untuk drop table ketika melakukan revert migrations
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Layananformnums');
    await queryInterface.dropTable('Layananforminputs');
    await queryInterface.dropTable('Layananforms');
    await queryInterface.dropTable('Layanans');
  }
};