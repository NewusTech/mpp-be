'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Instansis = [
      {
        name: 'Dinas Kesehatan',
        slug: 'dinas-kesehatan',
        desc: 'Dinas yang kesehatan',
        image: null,
        status: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Dinas Pendidikan',
        slug: 'dinas-pendidikan',
        desc: 'Dinas yang Pendidikan',
        image: null,
        status: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Instansis', Instansis, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Instansis', null, {});
  }
};
