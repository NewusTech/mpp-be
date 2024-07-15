'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Manualbooks = [
      {
        dokumen: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Manualbooks', Manualbooks, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Manualbooks', null, {});
  }
};
