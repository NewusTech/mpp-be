'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Bukutamus', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      instansi_id: {
        type: Sequelize.INTEGER
      },
      pekerjaan: {
        type: Sequelize.STRING
      },
      alamat: {
        type: Sequelize.STRING
      },
      tujuan: {
        type: Sequelize.STRING
      },
      tanggal: {
        type: Sequelize.DATE
      },
      waktu: {
        type: Sequelize.TIME
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

    await queryInterface.addConstraint('Bukutamus', {
      fields: ['instansi_id'],
      type: 'foreign key',
      name: 'custom_fkey_instansi_id44',
      references: {
        table: 'Instansis',
        field: 'id'
      }
    });

  },

  //untuk drop table ketika melakukan revert migrations
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Bukutamus');
  }
};