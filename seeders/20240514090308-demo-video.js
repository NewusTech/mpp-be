'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Videos = [
      {
        video: 'https://newus-bucket.s3.ap-southeast-2.amazonaws.com/dir_mpp/video/1719304306222-utomp3.com - Apa itu Mal Pelayanan Publik_480p.mp4',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Videos', Videos, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Videos', null, {});
  }
};
