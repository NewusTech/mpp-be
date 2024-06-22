'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Artikels = [
      {
        title: 'Mal Pelayanan Publik Lampung Timur Dibuka Tahun 2024',
        slug: 'mal-pelayanan-publik-lampung-timur-dibuka-tahun-2024',
        desc: 'Mal Pelayanan Publik Lampung Timur Dibuka Tahun 2024 dan dibuka untuk melayani warga Lampung Timur, sehingga mempermudah pelayanan baik online maupun offline',
        image: 'https://newus-bucket.s3.ap-southeast-2.amazonaws.com/dir_mpp/artikel/1718850740338-image_20240608T043237125Z.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Bupati Dawam Mal Pelayanan Publik (MPP) Akan Diresmikan Tahun 2024',
        slug: 'bupati-dawam-mal-pelayanan-publik-(mpp)-akan-diresmikan-tahun-2024',
        desc: 'Mal Pelayanan Publik Lampung Timur Dibuka Tahun 2024 dan dibuka untuk melayani warga Lampung Timur, sehingga mempermudah pelayanan baik online maupun offline',
        image: 'https://newus-bucket.s3.ap-southeast-2.amazonaws.com/dir_mpp/artikel/1718850887208-image_20240608T043237125Z.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Era Baru Pelayanan Publik di Lampung Timur: MPP Fisik dan Digital Segera Diresmikan',
        slug: 'era-baru-pelayanan-publik-di-lampung-timur:-mpp-fisik-dan-digital-segera-diresmikan',
        desc: 'MPP fisik nantinya akan menjadi pusat layanan publik terintegrasi yang menyediakan berbagai layanan dari berbagai instansi pemerintah dalam satu tempat.',
        image: 'https://newus-bucket.s3.ap-southeast-2.amazonaws.com/dir_mpp/artikel/1718851014176-image_20240608T043237125Z.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Tempat Bermain Anak di Mal Pelayanan Publik',
        slug: 'tempat-bermain-anak-di-mal-pelayanan-publik',
        desc: 'Untuk kenyamanan ibu dan anak, MPP menyediakan ruang laktasi yang nyaman dan tempat bermain anak. Fasilitas ini diharapkan dapat membuat pengunjung yang membawa anak merasa lebih nyaman selama berada di MPP.',
        image: 'https://newus-bucket.s3.ap-southeast-2.amazonaws.com/dir_mpp/artikel/1718851346083-1718763086609-fit_1635178530_9bee76a9d0263f26e020.jpeg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Artikels', Artikels, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Artikels', null, {});
  }
};
