'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Alurpermohonans = [
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
        desc: 'Pilih instansi dan layanan tujuan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        desc: 'Pastikan informasi data diri sudah diisi dan sudah benar',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        desc: 'Isi form dan upload persyaratan yang dibutuhkan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        desc: 'Submit',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Alurpermohonans', Alurpermohonans, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Alurpermohonans', null, {});
  }
};
