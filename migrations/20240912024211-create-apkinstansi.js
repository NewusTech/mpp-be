'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Apkinstansis', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      instansi_id: {
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      desc: {
        type: Sequelize.TEXT
      },
      file: {
        type: Sequelize.STRING
      },
      link: {
        type: Sequelize.STRING
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

    await queryInterface.addConstraint('Apkinstansis', {
      fields: ['instansi_id'],
      type: 'foreign key',
      name: 'custom_fkey_instansi_idfile',
      references: {
        table: 'Instansis',
        field: 'id'
      }
    });
  },

  //untuk drop table ketika melakukan revert migrations
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Apkinstansis');
  }
};