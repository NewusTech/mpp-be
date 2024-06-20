'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Userinfos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      nik: {
        type: Sequelize.STRING
      },
      slug: {
        type: Sequelize.STRING,
        unique: true
      },
      email: {
        type: Sequelize.STRING
      },
      telepon: {
        type: Sequelize.STRING
      },
      kec: {
        type: Sequelize.STRING
      },
      desa: {
        type: Sequelize.STRING
      },
      rt: {
        type: Sequelize.STRING
      },
      rw: {
        type: Sequelize.STRING
      },
      alamat: {
        type: Sequelize.STRING
      },
      agama: {
        type: Sequelize.SMALLINT
      },
      tempat_lahir: {
        type: Sequelize.STRING
      },
      tgl_lahir: {
        type: Sequelize.DATEONLY
      },
      status_kawin: {
        type: Sequelize.SMALLINT
      },
      gender: {
        type: Sequelize.SMALLINT
      },
      pekerjaan: {
        type: Sequelize.STRING
      },
      goldar: {
        type: Sequelize.SMALLINT
      },
      pendidikan: {
        type: Sequelize.SMALLINT
      },
      filektp: {
        type: Sequelize.STRING
      },
      filekk: {
        type: Sequelize.STRING
      },
      fileijazahsd: {
        type: Sequelize.STRING
      },
      fileijazahsmp: {
        type: Sequelize.STRING
      },
      fileijazahsma: {
        type: Sequelize.STRING
      },
      fileijazahlain: {
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

  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Userinfos');
  }
};