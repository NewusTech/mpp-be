'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Termconds = [
      {
        desc: '<p>Semua data yang anda masukkan akan dimasukkan ke database server MPP</p>',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Termconds', Termconds, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Termconds', null, {});
  }
};
