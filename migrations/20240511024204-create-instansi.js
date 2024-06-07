'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Instansis', {
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
      alamat: {
        type: Sequelize.STRING
      },
      pj: {
        type: Sequelize.STRING
      },
      nip_pj: {
        type: Sequelize.STRING
      },
      desc: {
        type: Sequelize.STRING
      },
      telp: {
        type: Sequelize.STRING
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
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  //untuk drop table ketika melakukan revert migrations
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Instansis');
  }
};