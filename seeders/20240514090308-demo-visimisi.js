'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Visimisis = [
      {
        visi: '<p>Terwujudnya Pelayanan Publik Prima berbasis teknologi informasi dan komunikasi</p>',
        misi: '<p>Memberikan pelayanan secara transparan, cepat, mudah, murah, aman dan nyama</p>',
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
