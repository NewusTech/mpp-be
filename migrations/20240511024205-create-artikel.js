'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Artikels', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
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
      },
      deletedAt: {
        type: Sequelize.DATE
      }
    });

    await queryInterface.addConstraint('Artikels', {
      fields: ['instansi_id'],
      type: 'foreign key',
      name: 'custom_fkey_instansi_id2',
      references: {
        table: 'Instansis',
        field: 'id'
      }
    });

  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Artikels');
  }
};