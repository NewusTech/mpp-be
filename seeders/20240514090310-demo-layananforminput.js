'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Layananforminputs = [
      {
        data: "Muttaqin",
        layananform_id:1,
        layananformnum_id:1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        data: "Pegawai Swasta",
        layananform_id:2,
        layananformnum_id:1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        data: "Botak, pendek, bantet",
        layananform_id:3,
        layananformnum_id:1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        data: 10000000,
        layananform_id:4,
        layananformnum_id:1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        data: "Beni Sikudagarong",
        layananform_id:1,
        layananformnum_id:2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        data: "Terduga Korupsi",
        layananform_id:2,
        layananformnum_id:2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        data: "Tinggi, gendut",
        layananform_id:3,
        layananformnum_id:2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Layananforminputs', Layananforminputs, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Layananforminputs', null, {});
  }
};
