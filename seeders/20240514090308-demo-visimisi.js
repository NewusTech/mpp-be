'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Visimisis = [
      {
        visi: 'Terwujudnya Pelayanan Publik Prima berbasis teknologi informasi dan komunikasi',
        misi: 'Memberikan pelayanan secara transparan, cepat, mudah, murah, aman dan nyama',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Visimisis', Visimisis, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Visimisis', null, {});
  }
};
