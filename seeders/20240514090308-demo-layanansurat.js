'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Layanansurats = [
      {
        layanan_id:1,
        header: "SURAT PEMBUATAN SKCK",
        body: "Surat ini dbuat untuk membuat SKCK dengan benar dan baik dan sesuai dengan prosudur yang ditetapkan dalam undang-undang.",
        footer: "Demikian surat ini dibut dan semoga yang bersangkutan dapat mengerjakan tanggung jawab ini dengan sebaik-baiknya. Atas perhatian dan kerja samanya, kami sampaikan terima kasih.",
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Layanansurats', Layanansurats, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Layanansurats', null, {});
  }
};
