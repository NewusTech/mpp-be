'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Layananforms = [
      {
        field: 'Nama / Instansi',
        tipedata: 'string',
        maxinput: 120,
        mininput: 3,
        status: true,
        isrequired: true,
        layanan_id:1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Lokasi',
        tipedata: 'string',
        maxinput: null,
        mininput: 3,
        status: true,
        isrequired: true,
        layanan_id:1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Perkiraan Peserta',
        tipedata: 'number',
        maxinput: null,
        mininput: 1,
        status: true,
        isrequired: true,
        layanan_id:1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Foto Lokasi',
        tipedata: 'file',
        maxinput: null,
        mininput: null,
        status: true,
        isrequired: true,
        layanan_id:1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Alamat Domisili Tujuan',
        tipedata: 'string',
        maxinput: 120,
        mininput: 3,
        status: true,
        isrequired: true,
        layanan_id:2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Alasan',
        tipedata: 'string',
        maxinput: null,
        mininput: 3,
        status: false,
        isrequired: true,
        layanan_id:2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Umur',
        tipedata: 'number',
        maxinput: null,
        mininput: 17,
        status: true,
        isrequired: true,
        layanan_id:2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Tanggal Pindah',
        tipedata: 'date',
        maxinput: null,
        mininput: null,
        status: true,
        isrequired: true,
        layanan_id:2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Layananforms', Layananforms, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Layananforms', null, {});
  }
};
