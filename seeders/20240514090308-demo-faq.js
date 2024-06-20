'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Faqs = [
      {
        question: 'Apa itu Mal Pelayanan Publik?',
        answer: 'Mal Pelayanan Publik adalah pusat layanan terpadu yang menyediakan berbagai layanan administrasi dan perizinan dari berbagai instansi pemerintah di satu lokasi untuk memudahkan masyarakat',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: 'Bagaimana cara mengakses layanan di Mal Pelayanan Publik?',
        answer: 'Anda bisa datang langsung ke lokasi Mal Pelayanan Publik atau mengakses beberapa layanan secara online melalui website resmi atau aplikasi mpp digital lampung timur.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: 'Apa jam operasional Mal Pelayanan Publik?',
        answer: 'Jam operasional mal pelayanan publik dari Senin hingga Jumat, pukul 08.00 - 16.00',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: 'Apa saja dokumen yang perlu dibawa saat mengakses layanan?',
        answer: 'Dokumen yang dibutuhkan tergantung pada jenis layanan yang Anda akses. Informasi lebih rinci tersedia di website ini atau di meja informasi Mal Pelayanan Publik.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        question: 'Apakah layanan di Mal Pelayanan Publik aman dan terpercaya?',
        answer: 'Ya, semua layanan di Mal Pelayanan Publik dijamin keamanannya dan dikelola oleh instansi resmi pemerintah.',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    await queryInterface.bulkInsert('Faqs', Faqs, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Faqs', null, {});
  }
};
