'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Layanansertifs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      layanan_id: {
        type: Sequelize.INTEGER
      },
      header: {
        type: Sequelize.STRING
      },
      body: {
        type: Sequelize.STRING
      },
      footer: {
        type: Sequelize.STRING
      },
      nomor: {
        type: Sequelize.STRING
      },
      perihal: {
        type: Sequelize.STRING
      },
      catatan: {
        type: Sequelize.STRING
      },
      tembusan: {
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

    await queryInterface.addConstraint('Layanansertifs', {
      fields: ['layanan_id'],
      type: 'foreign key',
      name: 'custom_fkey_layanan_idsertif',
      references: {
        table: 'Layanans',
        field: 'id'
      }
    });
  },

  //untuk drop table ketika melakukan revert migrations
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Layanansertifs');
  }
};