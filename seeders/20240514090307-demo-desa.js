'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const Desas = [
      { name: 'Sumber Agung', kecamatan_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Purbo Sembodo', kecamatan_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Kibang', kecamatan_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Margo Jaya', kecamatan_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Margo Toto', kecamatan_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Margo Sari', kecamatan_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Jaya Asri', kecamatan_id: 1, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Buana Sakti', kecamatan_id: 2, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Balai Kencono', kecamatan_id: 2, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Rejo Agung', kecamatan_id: 2, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Adi Warno', kecamatan_id: 2, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Nampi Rejo', kecamatan_id: 2, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Banar Joyo', kecamatan_id: 2, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Telogo Rejo', kecamatan_id: 2, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sumber Rejo', kecamatan_id: 2, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Banjar Rejo', kecamatan_id: 2, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Bumi Harjo', kecamatan_id: 2, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Bale Rejo', kecamatan_id: 2, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Batang Harjo', kecamatan_id: 2, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Bumi Mas', kecamatan_id: 2, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Selo Rejo', kecamatan_id: 2, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sri Basuki', kecamatan_id: 2, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sumber Agung', kecamatan_id: 2, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Purwodadi Mekar', kecamatan_id: 2, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Sidomukti', kecamatan_id: 3, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Karya Mukti', kecamatan_id: 3, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sidomulyo', kecamatan_id: 3, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sidodadi', kecamatan_id: 3, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Trimulyo', kecamatan_id: 3, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Girikarto', kecamatan_id: 3, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Hargomulyo', kecamatan_id: 3, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Wonokarto', kecamatan_id: 3, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Suko Harjo', kecamatan_id: 3, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Giri Kelopo Mulyo', kecamatan_id: 3, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sumber Gede', kecamatan_id: 3, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sambikarto', kecamatan_id: 3, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sumbersari', kecamatan_id: 3, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Mekar Mulya', kecamatan_id: 3, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Mekar Mukti', kecamatan_id: 3, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Jadi Mulyo', kecamatan_id: 3, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Mekar Sari', kecamatan_id: 3, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Jaya Guna', kecamatan_id: 4, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sukaraja Tiga', kecamatan_id: 4, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Gedung Wani', kecamatan_id: 4, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Gedung Wani Timur', kecamatan_id: 4, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Surya Mataram', kecamatan_id: 4, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Nabang Baru', kecamatan_id: 4, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Negeri Jemanten', kecamatan_id: 4, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Negeri Agung', kecamatan_id: 4, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Negeri Katon', kecamatan_id: 4, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sukadana Baru', kecamatan_id: 4, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Tanjung Harapan', kecamatan_id: 4, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Negeri Tua', kecamatan_id: 4, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Tri Sinar', kecamatan_id: 4, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Gunung Agung', kecamatan_id: 5, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Gunung Pasir Jaya', kecamatan_id: 5, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Gunung Sugih Besar', kecamatan_id: 5, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Bauh Gunung Sari', kecamatan_id: 5, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Brawijaya', kecamatan_id: 5, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sidorejo', kecamatan_id: 5, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pugung Raharjo', kecamatan_id: 5, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Bojong', kecamatan_id: 5, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Banjar Agung', kecamatan_id: 5, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Tuba', kecamatan_id: 5, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Mengandung Sari', kecamatan_id: 5, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sindang Anom', kecamatan_id: 5, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Bumi Mulyo', kecamatan_id: 5, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Gunung Mulyo', kecamatan_id: 5, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Purwo Kencono', kecamatan_id: 5, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Mekar Jaya', kecamatan_id: 6, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Adirejo', kecamatan_id: 6, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Asahan', kecamatan_id: 6, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Belimbing Sari', kecamatan_id: 6, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Gunung Mekar', kecamatan_id: 6, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Benteng Sari', kecamatan_id: 6, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Mumbang Jaya', kecamatan_id: 6, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Gunung Sugih Kecil', kecamatan_id: 6, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pematang Tahalo', kecamatan_id: 6, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Negara Batin', kecamatan_id: 6, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Negara Saka', kecamatan_id: 6, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Jabung', kecamatan_id: 6, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Adi Luhur', kecamatan_id: 6, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Tanjung Sari', kecamatan_id: 6, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sambi Rejo', kecamatan_id: 6, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Sumur Kucing', kecamatan_id: 7, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Labuhan Ratu', kecamatan_id: 7, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Kedung Ringin', kecamatan_id: 7, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Rejo Mulyo', kecamatan_id: 7, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Purworejo', kecamatan_id: 7, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Mulyo Sari', kecamatan_id: 7, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pasir Sakti', kecamatan_id: 7, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Mekar Sari', kecamatan_id: 7, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Marga Batin', kecamatan_id: 8, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sido Rahayu', kecamatan_id: 8, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Ngesti Karya', kecamatan_id: 8, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sumber Jaya', kecamatan_id: 8, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sumber Rejo', kecamatan_id: 8, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Mekar Karya', kecamatan_id: 8, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Tanjung Wangi', kecamatan_id: 8, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Tri Tunggal', kecamatan_id: 8, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Jembrana', kecamatan_id: 8, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Karang Anom', kecamatan_id: 8, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Karya Basuki', kecamatan_id: 8, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Bungkuk', kecamatan_id: 9, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Giri Mulyo', kecamatan_id: 9, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Gunung Mas', kecamatan_id: 9, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Batu Badak', kecamatan_id: 9, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Peniangan', kecamatan_id: 9, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Purwosari', kecamatan_id: 9, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Gunung Raya', kecamatan_id: 9, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Bukit Raya', kecamatan_id: 9, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Karyatani', kecamatan_id: 10, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Karya Makmur', kecamatan_id: 10, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Bandar Negeri', kecamatan_id: 10, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Maringgai', kecamatan_id: 10, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Muara Gading Mas', kecamatan_id: 10, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Labuhan Maringai', kecamatan_id: 10, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sri Gading', kecamatan_id: 10, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sri Minosari', kecamatan_id: 10, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Margasari', kecamatan_id: 10, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sukorahayu', kecamatan_id: 10, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Karang Anyar', kecamatan_id: 10, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Tulungpasik', kecamatan_id: 11, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Mandala Sari', kecamatan_id: 11, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Kebon Damar', kecamatan_id: 11, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Mataram Baru', kecamatan_id: 11, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Rajabasa Baru', kecamatan_id: 11, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Teluk Dalem', kecamatan_id: 11, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Wai Arang', kecamatan_id: 11, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Waringin Jaya', kecamatan_id: 12, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sri Bawono', kecamatan_id: 12, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sri Menanti', kecamatan_id: 12, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sri Pendowo', kecamatan_id: 12, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Bandar Agung', kecamatan_id: 12, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sadar Sriwijaya', kecamatan_id: 12, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Mekar Jaya', kecamatan_id: 12, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Sidomakmur', kecamatan_id: 13, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Tanjung Aji', kecamatan_id: 13, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Tebing', kecamatan_id: 13, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Wana', kecamatan_id: 13, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sumberhadi', kecamatan_id: 13, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Itik Rendai', kecamatan_id: 13, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Negeri Agung', kecamatan_id: 14, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pempen', kecamatan_id: 14, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pelindung Jaya', kecamatan_id: 14, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Wai Mili', kecamatan_id: 14, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Nibung', kecamatan_id: 14, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Braja Fajar', kecamatan_id: 15, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Braja Emas', kecamatan_id: 15, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Braja Caka', kecamatan_id: 15, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Braja Dewa', kecamatan_id: 15, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sri Wangi', kecamatan_id: 15, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Jepara', kecamatan_id: 15, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sumberjo', kecamatan_id: 15, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sri Rejosari', kecamatan_id: 15, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Labuhan Ratu Dua', kecamatan_id: 15, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sumur Bandung', kecamatan_id: 15, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Labuhan Ratu Satu', kecamatan_id: 15, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Braja Sakti', kecamatan_id: 15, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Braja Asri', kecamatan_id: 15, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sumber Marga', kecamatan_id: 15, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Labuhan Ratu Danau', kecamatan_id: 15, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Labuhan Ratu Baru', kecamatan_id: 15, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Braja Gemilang', kecamatan_id: 16, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Braja Luhur', kecamatan_id: 16, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Braja Kencana', kecamatan_id: 16, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Braja Harjosari', kecamatan_id: 16, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Braja Indah', kecamatan_id: 16, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Braja Yekti', kecamatan_id: 16, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Braja Mulya', kecamatan_id: 16, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Labuhan Ratu Empat', kecamatan_id: 17, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Labuhan Ratu Lima', kecamatan_id: 17, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Labuhan Ratu Tiga', kecamatan_id: 17, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Labuhan Ratu VII', kecamatan_id: 17, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Labuhan Ratu', kecamatan_id: 17, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Labuhan Ratu Enam', kecamatan_id: 17, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Raja Basa Lama', kecamatan_id: 17, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Raja Basa Lama Satu', kecamatan_id: 17, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Raja Basa Lama Dua', kecamatan_id: 17, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Labuhan Ratu VIII', kecamatan_id: 17, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Labuhan Ratu IX', kecamatan_id: 17, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Raja Basa Batanghari', kecamatan_id: 18, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sukadana', kecamatan_id: 18, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Putra Aji Dua', kecamatan_id: 18, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pakuan Aji', kecamatan_id: 18, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Bumi Nabung Udik', kecamatan_id: 18, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sukadana Timur', kecamatan_id: 18, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Surabaya Udik', kecamatan_id: 18, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Rantau Jaya Udik II', kecamatan_id: 18, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Muara Jaya', kecamatan_id: 18, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Rantau Jaya Udik', kecamatan_id: 18, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pasar Sukadana', kecamatan_id: 18, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Mataram Marga', kecamatan_id: 18, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Terbanggi Marga', kecamatan_id: 18, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sukadana Ilir', kecamatan_id: 18, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Negara Nabung', kecamatan_id: 18, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Bumi Ayu', kecamatan_id: 18, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Putra Aji I', kecamatan_id: 18, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sukadana Selatan', kecamatan_id: 18, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sukadana Tengah', kecamatan_id: 18, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sukadana Jaya', kecamatan_id: 18, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Marga Mulya', kecamatan_id: 19, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Donomulyo', kecamatan_id: 19, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Nyampir', kecamatan_id: 19, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Bumi Tinggi', kecamatan_id: 19, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Lehan', kecamatan_id: 19, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Catur Swako', kecamatan_id: 19, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Mulyo Asri', kecamatan_id: 19, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Gunung Tiga', kecamatan_id: 20, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sukacari', kecamatan_id: 20, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Negara Ratu', kecamatan_id: 20, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Bumi Jawa', kecamatan_id: 20, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Gedung Dalam', kecamatan_id: 20, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sukaraja Nuban', kecamatan_id: 20, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Trisno Mulyo', kecamatan_id: 20, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Cempaka Nuban', kecamatan_id: 20, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Kedaton II (Dua)', kecamatan_id: 20, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Kedaton Induk', kecamatan_id: 20, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Kedaton I (Satu)', kecamatan_id: 20, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Tulung Balak', kecamatan_id: 20, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Purwosari', kecamatan_id: 20, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Adirejo', kecamatan_id: 21, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sidodadi', kecamatan_id: 21, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Gondang Rejo', kecamatan_id: 21, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Siraman', kecamatan_id: 21, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pekalongan', kecamatan_id: 21, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Tulus Rejo', kecamatan_id: 21, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Jojog', kecamatan_id: 21, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Ganti Warno', kecamatan_id: 21, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Kali Bening', kecamatan_id: 21, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Wono Sari', kecamatan_id: 21, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Adijaya', kecamatan_id: 21, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Gantimulyo', kecamatan_id: 21, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Raman Aji', kecamatan_id: 22, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Rukti Sediyoo', kecamatan_id: 22, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Ratna Daya', kecamatan_id: 22, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Kota Raman', kecamatan_id: 22, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Rejo Binangun', kecamatan_id: 22, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Rantau Fajar', kecamatan_id: 22, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Raman Endra', kecamatan_id: 22, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Raman Fajar', kecamatan_id: 22, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Restu Rahayu', kecamatan_id: 22, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Rejo Katon', kecamatan_id: 22, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Rama Puja', kecamatan_id: 22, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Taman Asri', kecamatan_id: 23, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Taman Bogo', kecamatan_id: 23, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Tambah Dadi', kecamatan_id: 23, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Taman Cari', kecamatan_id: 23, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Taman Endah', kecamatan_id: 23, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Taman Fajar', kecamatan_id: 23, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Tegal Gondo', kecamatan_id: 23, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Toto Harjo', kecamatan_id: 23, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Tambah Luhur', kecamatan_id: 23, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Tanjung Inten', kecamatan_id: 23, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Tegal Yoso', kecamatan_id: 23, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Tanjung Kesuma', kecamatan_id: 23, createdAt: new Date(), updatedAt: new Date() },

      { name: 'Toto Mulyo', kecamatan_id: 24, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Tegal Ombo', kecamatan_id: 24, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Toto Projo', kecamatan_id: 24, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Taman Negeri', kecamatan_id: 24, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Tanjung Kencono', kecamatan_id: 24, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Tambah Subur', kecamatan_id: 24, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Tanjung Tirto', kecamatan_id: 24, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Kali Pasir', kecamatan_id: 24, createdAt: new Date(), updatedAt: new Date() }
    ];

    await queryInterface.bulkInsert('Desas', Desas, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Desas', null, {});
  }
};