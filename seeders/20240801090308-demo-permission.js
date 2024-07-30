'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Permissions = [
      {
        name: 'Buat Permohonan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Validasi Permohonan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Setujui Permohonan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Permissions', Permissions, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Permissions', null, {});
  }
};
