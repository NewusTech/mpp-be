'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Artikels = [
      {
        title: 'Mall Pelayanan Publik Lampung Timur Dibuka Tahun 2024',
        slug: 'mall-pelayanan-publik-lampung-timur-dibuka-tahun-2024',
        image: 'https://res.cloudinary.com/dpprzvs5d/image/upload/v1717564425/mpp/artikel/image_20240605T051338723Z.jpg',
        desc: 'Mall Pelayanan Publik Lampung Timur Dibuka Tahun 2024 dan dibuka untuk melayani warga Lampung Timur, sehingga mempermudah pelayanan baik online maupun offline',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Bupati Dawam Mal Pelayanan Publik (MPP) Akan Diresmikan Tahun 2024',
        slug: 'bupati-dawam-mal-pelayanan-publik-(mpp)-akan-diresmikan-tahun-2024',
        image: 'https://res.cloudinary.com/dpprzvs5d/image/upload/v1717564988/mpp/artikel/image_20240605T052303529Z.jpg',
        desc: 'Mall Pelayanan Publik Lampung Timur Dibuka Tahun 2024 dan dibuka untuk melayani warga Lampung Timur, sehingga mempermudah pelayanan baik online maupun offline',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Artikels', Artikels, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Artikels', null, {});
  }
};
