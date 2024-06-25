'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Aplikasietcs = [
      {
        name: 'DPMPTSP Kab. Lampung Timur',
        slug: 'dpmptsp-kab.-lampung-timur',
        image: 'https://newus-bucket.s3.ap-southeast-2.amazonaws.com/dir_mpp/aplikasietc/1719307471333-logo.png',
        link: "https://perizinanlamtim.id/",
        desc: "Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu ( DPMPTSP ) mempunyai tugas membantu Bupati melaksanakan urusan pemerintahan daerah di bidang Penanaman Modal dan Pelayanan Terpadu Satu Pintu, menyelenggarakan pelayanan administrasi di bidang Perizinan.",
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Aplikasietcs', Aplikasietcs, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Aplikasietcs', null, {});
  }
};
