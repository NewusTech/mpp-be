'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Instansis = [
      {
        name: 'Dinas Kesehatan',
        slug: 'dinas-kesehatan',
        desc: 'Dinas yang kesehatan',
        image: 'https://res.cloudinary.com/dpprzvs5d/image/upload/v1716348892/mpp/instansi/image_20240522T033448276Z.png',
        status: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Dinas Pendidikan',
        slug: 'dinas-pendidikan',
        desc: 'Dinas yang Pendidikan',
        image: "https://res.cloudinary.com/dpprzvs5d/image/upload/v1716349843/mpp/instansi/image_20240522T035040587Z.jpg",
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
