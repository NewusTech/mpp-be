'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Layanans = [
      {
        name: 'Pengajuan Imunisasi Massal',
        slug: 'pengajuan-imunisasi-massal',
        desc: 'Imunisasi kepada balita untuk setiap kalangan masyarakat',
        image: "https://res.cloudinary.com/dpprzvs5d/image/upload/v1716350281/mpp/layanan/image_20240522T035758624Z.png",
        status: false,
        instansi_id: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Pengajuan Perubahan Domisili',
        slug: 'pengajuan-perubahan-domisili',
        desc: 'Pengajuan perubahan domisili tempat tinggal',
        image: "https://res.cloudinary.com/dpprzvs5d/image/upload/v1716350300/mpp/layanan/image_20240522T035816783Z.webp",
        status: false,
        instansi_id: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Pengajuan Pembuatan KTP',
        slug: 'pengajuan-pembuatan-ktp',
        desc: 'Pengajuan pembuatan KTP elektronik',
        image: "https://res.cloudinary.com/dpprzvs5d/image/upload/v1716350290/mpp/layanan/image_20240522T035807918Z.jpg",
        status: false,
        instansi_id: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Layanans', Layanans, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Layananforms', null, {});
    await queryInterface.bulkDelete('Layanans', null, {});
  }
};
