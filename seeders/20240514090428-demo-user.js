'use strict';

const passwordHash = require('password-hash');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = [
      {
        userinfo_id: 1,
        slug: "bupati-20240620041615213",
        password: passwordHash.generate('123456'),
        instansi_id: null,
        role_id: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userinfo_id: 2,
        password: passwordHash.generate('123456'),
        slug: "superadmin-20240620041615213",
        instansi_id: 2,
        role_id: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userinfo_id: 3,
        slug: "adminpolres-20240620041615213",
        password: passwordHash.generate('123456'),
        instansi_id: 1,
        role_id: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userinfo_id: 4,
        password: passwordHash.generate('123456'),
        slug: "staffpolres-20240620041615213",
        instansi_id: 1,
        role_id: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userinfo_id: 5,
        password: passwordHash.generate('123456'),
        slug: "Muhammad Muttaqin-20240620041615213",
        instansi_id: null,
        role_id: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userinfo_id: 6,
        password: passwordHash.generate('123456'),
        slug: "Chanzu-20240620041615213",
        instansi_id: null,
        role_id: 5,
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
