'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Alurmpps = [
      {
        image: 'https://newus-bucket.s3.ap-southeast-2.amazonaws.com/dir_mpp/alurmpp/1719306240962-Screenshot%202024-06-25%20155815.png',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Alurmpps', Alurmpps, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Alurmpps', null, {});
  }
};
