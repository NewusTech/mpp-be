'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Carousels = [
      {
        image: 'https://newus-bucket.s3.ap-southeast-2.amazonaws.com/dir_mpp/carousel/1718953517757-Screenshot 2024-03-24 100449.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Carousels', Carousels, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Carousels', null, {});
  }
};
