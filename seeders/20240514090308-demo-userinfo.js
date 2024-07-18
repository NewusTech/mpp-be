'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Userinfos = [
      {
        name: 'Bupati',
        nik: 'bupati',
        slug: "bupati-20240620041615213",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Super Admin',
        nik: 'superadmin',
        slug: "superadmin-20240620041615213",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Super Admin Polres',
        nik: 'superadminpolres',
        slug: "superadminpolres-20240620041615213",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Admin Verifikasi Polres',
        nik: 'adminverifpolres',
        slug: "adminverifpolres-20240620041615213",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Muhammad Muttaqin',
        nik: '1871030708990013',
        slug: "Muhammad Muttaqin-20240620041615213",
        email: 'muttaqin0708@gmail.com',
        telepon: '089626613284',
        alamat: 'Jl. Kamboja, Gunung Agung',
        kecamatan_id: 1,
        desa_id: 1,
        rt: "001",
        rw: "000",
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
      },
      {
        name: 'Chanzu',
        nik: '1871030405990010',
        slug: "Chanzu-20240620041615213",
        email: 'chanzu@gmail.com',
        telepon: '08994264065',
        alamat: 'Jl. Landak No. 69',
        kecamatan_id: 1,
        desa_id: 2,
        rt: "001",
        rw: "000",
        agama: 1,
        tempat_lahir: 'Bandar Lampung',
        tgl_lahir: '1999-04-03',
        status_kawin: 2,
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
      },
      {
        name: 'Ida Tanggobuntung',
        nik: '1871030405990021',
        slug: "Ida-20240620041615213",
        email: 'ida@gmail.com',
        telepon: '089797977013',
        alamat: 'Jl. Bumi Abadi No. 14',
        kecamatan_id: 1,
        desa_id: 3,
        rt: "001",
        rw: "000",
        agama: 1,
        tempat_lahir: 'Bandar Lampung',
        tgl_lahir: '1999-08-08',
        status_kawin: 2,
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
      },
      {
        name: 'Admin Layanan Polres - 01',
        nik: 'admlayananpolres1',
        slug: "admlayananpolres1-20240620041615213",
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Userinfos', Userinfos, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Userinfos', null, {});
  }
};
