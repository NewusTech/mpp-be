'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Alurbookings = [
      {
        desc: 'Buat akun pengguna di aplikasi / website MPP digital',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        desc: 'Login menggunakan akun yang sudah dibuat',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        desc: 'Pilih instansi dan layanan yang akan dituju, kemudian pilih tanggal booking antrian',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        desc: 'Submit',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Alurbookings', Alurbookings, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Alurbookings', null, {});
  }
};
