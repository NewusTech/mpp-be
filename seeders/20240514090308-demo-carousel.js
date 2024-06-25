'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Carousels = [
      {
        image: "https://newus-bucket.s3.ap-southeast-2.amazonaws.com/dir_mpp/carousel/1719284467020-East_Lampung_Regent's_Office.jpg",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        image: "https://newus-bucket.s3.ap-southeast-2.amazonaws.com/dir_mpp/carousel/1719284554766-unnamed.jpg",
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
