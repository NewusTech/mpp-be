'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Surveyforms = [
      {
        field: 'Apakah aplikasi MPP yang digunakan mudah dipahami dan tidak sulit untuk digunakan?',
        status: true,
        instansi_id:1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Apakah pelayanan polres di MPP sangat baik?',
        status: true,
        instansi_id:1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Apakah aplikasi MPP yang digunakan mudah dipahami dan tidak sulit untuk digunakan?',
        status: true,
        instansi_id:2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Apakah pelayanan pengadilan agama di MPP sangat baik?',
        status: false,
        instansi_id:2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Surveyforms', Surveyforms, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Surveyforms', null, {});
  }
};
