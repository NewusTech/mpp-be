'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Layananforms = [
      {
        field: 'Nama Pelapor',
        tipedata: 'string',
        maxinput: 120,
        mininput: 3,
        status: true,
        isrequired: true,
        layanan_id:1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Identitas Tersangka',
        tipedata: 'string',
        maxinput: null,
        mininput: 3,
        status: true,
        isrequired: true,
        layanan_id:1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Deskripsi fisik',
        tipedata: 'textarea',
        maxinput: null,
        mininput: 1,
        status: true,
        isrequired: true,
        layanan_id:1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Perkiraan Kerugian',
        tipedata: 'number',
        maxinput: null,
        mininput: null,
        status: true,
        isrequired: true,
        layanan_id:1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Barang Bukti',
        tipedata: 'file',
        maxinput: null,
        mininput: null,
        status: true,
        isrequired: true,
        layanan_id:1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Tanggal Kejadian',
        tipedata: 'date',
        maxinput: null,
        mininput: null,
        status: true,
        isrequired: true,
        layanan_id:1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Nama Majelis Taklim',
        tipedata: 'string',
        maxinput: 120,
        mininput: 3,
        status: true,
        isrequired: true,
        layanan_id:2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Surat Permohonan',
        tipedata: 'file',
        maxinput: null,
        mininput: null,
        status: true,
        isrequired: true,
        layanan_id:2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Nama Pemberi Kerja',
        tipedata: 'text',
        maxinput: null,
        mininput: null,
        status: true,
        isrequired: true,
        layanan_id: 63,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Alamat',
        tipedata: 'text',
        maxinput: null,
        mininput: null,
        status: true,
        isrequired: true,
        layanan_id: 63,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'No Telepon',
        tipedata: 'number',
        maxinput: null,
        mininput: null,
        status: true,
        isrequired: true,
        layanan_id: 63,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Alamat Email',
        tipedata: 'text',
        maxinput: null,
        mininput: null,
        status: true,
        isrequired: true,
        layanan_id: 63,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Kepemilikan',
        tipedata: 'radio',
        datajson: '[{"id":1,"key":"Swasta Nasional"},{"id":2,"key":"Swasta Asing"},{"id":3,"key":"BUMN"},{"id":4,"key":"BUMD"},{"id":5,"key":"Perseorangan"},{"id":6,"key":"Koperasi"},{"id":7,"key":"Yayasan"},{"id":8,"key":"Sekolah, Perguruan Tinggi, Kursus"},{"id":9,"key":"Lain-lain"}]',
        maxinput: null,
        mininput: null,
        status: true,
        isrequired: true,
        layanan_id: 63,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Nomor Ijin Usaha',
        tipedata: 'text',
        maxinput: null,
        mininput: null,
        status: false,
        isrequired: false,
        layanan_id: 63,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Jenis Usaha Utama',
        tipedata: 'text',
        maxinput: null,
        mininput: null,
        status: false,
        isrequired: false,
        layanan_id: 63,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'NPWP Badan',
        tipedata: 'text',
        maxinput: null,
        mininput: null,
        status: true,
        isrequired: true,
        layanan_id: 63,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Status Pemberi Kerja',
        tipedata: 'radio',
        datajson: '[{"id":1,"key":"Pusat"},{"id":2,"key":"Daerah"},{"id":3,"key":"Cabang"},{"id":4,"key":"Anak Perusahaan"},{"id":5,"key":"Cabang Anak Perusahaan"}]',
        maxinput: null,
        mininput: null,
        status: false,
        isrequired: false,
        layanan_id: 63,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Jumlah Aset',
        tipedata: 'radio',
        datajson: '[{"id":1,"key":"> Rp. 10.000.000.000,-"},{"id":2,"key":"> Rp. 500.000.000,- s/d Rp. 10.000.000.000,-"},{"id":3,"key":"> Rp. 50.000.000,- s/d Rp. 500.000.000,-"},{"id":4,"key":"< Rp. 50.000.000,- BAGIAN II: DATA KANTOR PUSA(diisi bila Badan Usaha/Asosiasi"}]',
        maxinput: null,
        mininput: null,
        status: true,
        isrequired: true,
        layanan_id: 63,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Jumlah Omset Pertahun',
        tipedata: 'text',
        maxinput: null,
        mininput: null,
        status: false,
        isrequired: false,
        layanan_id: 63,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        field: 'Nomor Pendaftaran Pemberi Kerja',
        tipedata: 'text',
        maxinput: null,
        mininput: null,
        status: false,
        isrequired: false,
        layanan_id: 63,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Layananforms', Layananforms, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Layananforms', null, {});
  }
};
