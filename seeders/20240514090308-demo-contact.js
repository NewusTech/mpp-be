'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Contacts = [
      {
        alamat: 'Sukadana Ilir, Kec. Sukadana, Kabupaten Lampung Timur, Lampung',
        email: 'dpmptsp@perizinanlamtim.id',
        telp: '085966171228',
        latitude: '-5.0471501',
        longitude: '105.5240066',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Contacts', Contacts, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Contacts', null, {});
  }
};
