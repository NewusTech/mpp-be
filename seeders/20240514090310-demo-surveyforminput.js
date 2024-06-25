'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Surveyforminputs = [
      {
        nilai: 4,
        surveyform_id:1,
        surveyformnum_id:1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nilai: 3,
        surveyform_id:2,
        surveyformnum_id:1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nilai: 4,
        surveyform_id:1,
        surveyformnum_id:2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nilai: 4,
        surveyform_id:2,
        surveyformnum_id:2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Surveyforminputs', Surveyforminputs, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Surveyforminputs', null, {});
  }
};
