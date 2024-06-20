'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Roles = [
      {
        name: 'Bupati',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Super Admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Admin Instansi',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Staff Instansi',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'User',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Roles', Roles, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Roles', null, {});
  }
};
