'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Facilities = [
      {
        title: 'ATM Center',
        slug: 'atm-center',
        image: 'https://newus-bucket.s3.ap-southeast-2.amazonaws.com/dir_mpp/facilities/1718851667106-1718753258499-images (1).jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Pojok Baca Digital',
        slug: 'pojok-baca-digital',
        image: 'https://newus-bucket.s3.ap-southeast-2.amazonaws.com/dir_mpp/facilities/1718851671545-1718757057946-Mal-Pelayanan-Publik-lewat-fasilitas-Pojok-Baca-Digital-alias-Pocadi-Jumat-1312022.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Play Land',
        slug: 'play-land',
        image: 'https://newus-bucket.s3.ap-southeast-2.amazonaws.com/dir_mpp/facilities/1718851677530-1718758700732-fit_1635178530_9bee76a9d0263f26e020.jpeg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Pelayanan Cepat',
        slug: 'pelayanan-cepat',
        image: 'https://newus-bucket.s3.ap-southeast-2.amazonaws.com/dir_mpp/facilities/1718851681734-1718758724794-0d33b9d52afdce1204157ad6ce4327c2_mpp-kudus-e.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Facilities', Facilities, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Facilities', null, {});
  }
};
