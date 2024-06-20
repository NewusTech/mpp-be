'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Layananforms = [
      {
        field: 'Nama Pelapor',
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
        field: 'Identitas Tersangka',
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
        field: 'Deskripsi fisik',
        tipedata: 'textarea',
        maxinput: null,
        mininput: 1,
        status: true,
        isrequired: true,
        layanan_id:1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Perkiraan Kerugian',
        tipedata: 'number',
        maxinput: null,
        mininput: null,
        status: true,
        isrequired: true,
        layanan_id:1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Barang Bukti',
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
        field: 'Tanggal Kejadian',
        tipedata: 'date',
        maxinput: null,
        mininput: null,
        status: true,
        isrequired: true,
        layanan_id:1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Nama Majelis Taklim',
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
        field: 'Surat Permohonan',
        tipedata: 'file',
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
