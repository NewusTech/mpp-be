'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Surveyformnums = [
      {
        userinfo_id: 5,
        layanan_id:1,
        kritiksaran:"Aplikasi sudah bagus dan sangat membantu. Saran dari saya pelayanannya lebih cepat.",
        date: '2024-06-25',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userinfo_id: 6,
        layanan_id:1,
        kritiksaran:"Saya sebagai orang tua kesulitan.",
        date: '2024-06-25',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Surveyformnums', Surveyformnums, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Surveyformnums', null, {});
  }
};
