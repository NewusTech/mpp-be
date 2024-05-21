'use strict';

const passwordHash = require('password-hash');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = [
      {
        name: 'Super Admin',
        email: 'superadmin@gmail.com',
        password: passwordHash.generate('123456'),
        instansi_id: null,
        role_id: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Muttaqin',
        email: 'muttaqin0708@gmail.com',
        password: passwordHash.generate('123456'),
        instansi_id: 1,
        role_id: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Users', users, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
