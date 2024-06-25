'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Layananformnums = [
      {
        userinfo_id: 5,
        layanan_id:1,
        isonline:true,
        status: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userinfo_id: 6,
        layanan_id:1,
        isonline:false,
        status: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Layananformnums', Layananformnums, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Layananformnums', null, {});
  }
};
