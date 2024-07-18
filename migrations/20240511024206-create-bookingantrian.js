'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Bookingantrians', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      instansi_id: {
        type: Sequelize.INTEGER
      },
      layanan_id: {
        type: Sequelize.INTEGER
      },
      userinfo_id: {
        type: Sequelize.INTEGER
      },
      qrkey: {
        type: Sequelize.STRING,
      },
      qrcode: {
        type: Sequelize.STRING,
      },
      tanggal: {
        type: Sequelize.DATEONLY
      },
      waktu: {
        type: Sequelize.TIME
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

    await queryInterface.addConstraint('Bookingantrians', {
      fields: ['layanan_id'],
      type: 'foreign key',
      name: 'custom_fkey_layanan_id22',
      references: {
        table: 'Layanans',
        field: 'id'
      }
    });

    await queryInterface.addConstraint('Antrians', {
      fields: ['instansi_id'],
      type: 'foreign key',
      name: 'custom_fkey_instansi_id22',
      references: {
        table: 'Instansis',
        field: 'id'
      }
    });

    await queryInterface.addConstraint('Antrians', {
      fields: ['userinfo_id'],
      type: 'foreign key',
      name: 'custom_fkey_userinfo_id22',
      references: {
        table: 'Userinfos',
        field: 'id'
      }
    });
  },

  //untuk drop table ketika melakukan revert migrations
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Bookingantrians');
  }
};