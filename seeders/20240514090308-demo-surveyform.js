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
      {
        field: 'Persyaratan Pelayanan jelas dan mudah di dipenuhi oleh masyarakat?',
        desc: null,
        status: true,
        instansi_id: 2,
        createdAt: new Date('2024-06-20T15:07:32.041+07:00'),
        updatedAt: new Date('2024-06-20T15:07:32.041+07:00')
      },
      {
        field: 'Informasi alur prosedur pelayanan jelas, sederhana dan mudah dipahami masyarakat?',
        desc: null,
        status: true,
        instansi_id: 2,
        createdAt: new Date('2024-06-20T15:07:32.043+07:00'),
        updatedAt: new Date('2024-06-20T15:07:32.043+07:00')
      },
      {
        field: 'Proses waktu pelayanan sesuai dengan informasi yang tertera dalam alur pelayanan?',
        desc: null,
        status: true,
        instansi_id: 2,
        createdAt: new Date('2024-06-20T15:07:32.044+07:00'),
        updatedAt: new Date('2024-06-20T15:07:32.044+07:00')
      },
      {
        field: 'Biaya pelayanan tertera jelas dan terbuka sehingga diketahui oleh masyarakat?',
        desc: null,
        status: true,
        instansi_id: 2,
        createdAt: new Date('2024-06-20T15:07:32.045+07:00'),
        updatedAt: new Date('2024-06-20T15:07:32.045+07:00')
      },
      {
        field: 'Tidak dipungut biaya dalam semua jenis layanan sesuai ketentuan?',
        desc: null,
        status: true,
        instansi_id: 2,
        createdAt: new Date('2024-06-20T15:07:32.046+07:00'),
        updatedAt: new Date('2024-06-20T15:07:32.046+07:00')
      },
      {
        field: 'Sarana pengaduan/keluhan pelayanan tersedia dan ada tindaklanjut pengaduan?',
        desc: null,
        status: true,
        instansi_id: 2,
        createdAt: new Date('2024-06-20T15:07:32.047+07:00'),
        updatedAt: new Date('2024-06-20T15:07:32.047+07:00')
      },
      {
        field: 'Perilaku petugas pelayanan ramah dan jumlahnya sesuai sehingga tidak menimbulkan antrian?',
        desc: null,
        status: true,
        instansi_id: 2,
        createdAt: new Date('2024-06-20T15:07:32.048+07:00'),
        updatedAt: new Date('2024-06-20T15:07:32.048+07:00')
      },
      {
        field: 'Petugas pelayanan sigap dan cekatan serta memiliki pengetahuan dan ketrampilan yang memadai?',
        desc: null,
        status: true,
        instansi_id: 2,
        createdAt: new Date('2024-06-20T15:07:32.049+07:00'),
        updatedAt: new Date('2024-06-20T15:07:32.049+07:00')
      },
      {
        field: 'Sikap dan perilaku petugas pelayanan baik. Sopan dan bertanggung jawab dalam menyelesaikan pelayanan?',
        desc: null,
        status: true,
        instansi_id: 2,
        createdAt: new Date('2024-06-20T15:07:32.050+07:00'),
        updatedAt: new Date('2024-06-20T15:07:32.050+07:00')
      },
      {
        field: 'Terdapat sarana dan prasarana pelayanan yang bersih, rapih, nyaman dan layak digunakan?',
        desc: null,
        status: true,
        instansi_id: 2,
        createdAt: new Date('2024-06-20T15:07:32.051+07:00'),
        updatedAt: new Date('2024-06-20T15:07:32.051+07:00')
      }
    ];

    await queryInterface.bulkInsert('Surveyforms', Surveyforms, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Surveyforms', null, {});
  }
};
