'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Faqs = [
      {
        question: 'Bagaimana Cara Menggunakan MPP Online?',
        answer: 'Tinggal download dan pake, jangan katro',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: 'Apakah user harus download aplikasi untuk menggunakan MPP online?',
        answer: 'Jika user tidak ingin download apk MPP online, user dapat menggunakan versi web di link www.xxx.com',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Faqs', Faqs, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Faqs', null, {});
  }
};
