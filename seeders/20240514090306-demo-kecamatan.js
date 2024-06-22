'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Kecamatans = [
      { name: 'Metro Kibang', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Batanghari', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sekampung', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Margatiga', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sekampung Udik', createdAt: new Date(), updatedAt: new Date() },

      { name: 'Jabung', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pasir Sakti', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Waway Karya', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Marga Sekampung', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Labuhan Maringgai', createdAt: new Date(), updatedAt: new Date() },

      { name: 'Mataram Baru', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Bandar Sribawono', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Melinting', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Gunung Pelindung', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Way Jepara', createdAt: new Date(), updatedAt: new Date() },

      { name: 'Braja Slebah', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Labuhan Ratu', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sukadana', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Bumi Agung', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Batanghari Nuban', createdAt: new Date(), updatedAt: new Date() },
      
      { name: 'Pekalongan', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Raman Utara', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Purbolinggo', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Way Bungur', createdAt: new Date(), updatedAt: new Date() },

    ];

    await queryInterface.bulkInsert('Kecamatans', Kecamatans, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Kecamatans', null, {});
  }
};
