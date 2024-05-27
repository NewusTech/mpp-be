'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Userinfos = [
      {
        name: 'Super Admin',
        nik: 'superadmin',
        email: null,
        telepon: null,
        alamat: null,
        agama: null,
        tempat_lahir: null,
        tgl_lahir: null,
        status_kawin: null,
        gender: null,
        pekerjaan: null,
        goldar: null,
        pendidikan: null,
        filektp: null,
        filekk: null,
        fileijazahsd: null,
        fileijazahsmp: null,
        fileijazahsma: null,
        fileijazahlain: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Admin Dinkes',
        nik: 'dinkes',
        email: null,
        telepon: null,
        alamat: null,
        agama: null,
        tempat_lahir: null,
        tgl_lahir: null,
        status_kawin: null,
        gender: null,
        pekerjaan: null,
        goldar: null,
        pendidikan: null,
        filektp: null,
        filekk: null,
        fileijazahsd: null,
        fileijazahsmp: null,
        fileijazahsma: null,
        fileijazahlain: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Muhammad Muttaqin',
        nik: '1871030708990013',
        email: 'muttaqin0708@gmail.com',
        telepon: '089626613284',
        alamat: 'Jl. Kamboja, Gunung Agung',
        agama: 1,
        tempat_lahir: 'Bandar Lampung',
        tgl_lahir: '1999-08-07',
        status_kawin: 1,
        gender: 1,
        pekerjaan: "Hacker Akhirat",
        goldar: 1,
        pendidikan: 1,
        filektp: null,
        filekk: null,
        fileijazahsd: null,
        fileijazahsmp: null,
        fileijazahsma: null,
        fileijazahlain: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Userinfos', Userinfos, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Userinfos', null, {});
  }
};
