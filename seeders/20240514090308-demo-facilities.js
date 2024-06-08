'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Facilities = [
      {
        image: 'https://res.cloudinary.com/dpprzvs5d/image/upload/v1717816969/mpp/facilities/image_20240608T032247695Z.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        image: 'https://res.cloudinary.com/dpprzvs5d/image/upload/v1717816984/mpp/facilities/image_20240608T032301251Z.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Facilities', Facilities, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Facilities', null, {});
  }
};
