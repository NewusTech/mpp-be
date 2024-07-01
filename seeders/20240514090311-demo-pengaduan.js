'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Pengaduans = [
      {
        judul: 'Gak bisa input data saat ngajuin permohonan',
        aduan: 'Saat mau input data, gagal terus. Itu kenapa ya?',
        status: 0,
        layanan_id:1,
        instansi_id:1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        judul: 'Loading terus saat buka MPP',
        aduan: 'Loading terus gak selesai-selesai',
        status: 0,
        layanan_id:1,
        instansi_id:1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Pengaduans', Pengaduans, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Pengaduans', null, {});
  }
};
