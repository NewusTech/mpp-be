'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Layanans = [
      {
        name: 'Surat Keterangan Sakit Jiwa',
        slug: 'surat-keterangan-sakit-jiwa',
        desc: 'Surat Keterangan Gila adalah surat yang memverifikasi bahwa seseorang sudah benar-benar gila',
        image: null,
        status: false,
        instansi_id: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Surat Izin Bunuh Diri',
        slug: 'surat-izin-bunuh-diri',
        desc: 'Surat izin yang diberikan kepada orang yang sudah depresi dan tidak memiliki tujuan hidup lagi',
        image: null,
        status: false,
        instansi_id: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Layanans', Layanans, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Layanans', null, {});
  }
};
