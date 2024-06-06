'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Instansis = [
      {
        name: 'Dinas Kesehatan',
        slug: 'dinas-kesehatan',
        alamat: 'Sukadana Ilir, Kec. Sukadana, Kabupaten Lampung Timur, Lampung',
        telp: "89626613284",
        desc: 'Dinas yang kesehatan',
        pj: 'Prof. Dr. M. Muttaqin S.T, M.T.',
        nip_pj: '123123123123',
        image: 'https://res.cloudinary.com/dpprzvs5d/image/upload/v1716348892/mpp/instansi/image_20240522T033448276Z.png',
        active_offline: false,
        active_online: false,
        status: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Dinas Kependudukan dan Catatan Sipil',
        slug: 'dinas-kependudukan-dan-catatan-sipil',
        alamat: 'Sukadana Ilir, Kec. Sukadana, Kabupaten Lampung Timur, Lampung',
        telp: "89626613284",
        desc: 'Dinas yang Kependudukan dan Catatan Sipil',
        pj: 'Mr. Quin',
        nip_pj: '6969696969696969',
        image: "https://res.cloudinary.com/dpprzvs5d/image/upload/v1716349843/mpp/instansi/image_20240522T035040587Z.jpg",
        active_offline: false,
        active_online: false,
        status: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Instansis', Instansis, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Instansis', null, {});
  }
};
