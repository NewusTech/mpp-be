'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Layananformnums', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userinfo_id: {
        type: Sequelize.INTEGER
      },
      layanan_id: {
        type: Sequelize.INTEGER
      },
      isonline: {
        type: Sequelize.BOOLEAN
      },
      status: {
        type: Sequelize.SMALLINT
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

    await queryInterface.addConstraint('Layananformnums', {
      fields: ['userinfo_id'],
      type: 'foreign key',
      name: 'custom_fkey_userinfo_id',
      references: {
        table: 'Userinfos',
        field: 'id'
      }
    });

    await queryInterface.addConstraint('Layananformnums', {
      fields: ['layanan_id'],
      type: 'foreign key',
      name: 'custom_fkey_layanan_id',
      references: {
        table: 'Layanans',
        field: 'id'
      }
    });
  },

  //untuk drop table ketika melakukan revert migrations
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Layananformnums');
  }
};