const { response } = require('../helpers/response.formatter');

const { Layananformnum } = require('../models');
const { generatePagination } = require('../pagination/pagination');
const { Op } = require('sequelize');

module.exports = {

    //mendapatkan semua data instansi
    get_statistik: async (req, res) => {
        try {
            // Ambil data untuk 3 tahun terakhir
            const currentYear = new Date().getFullYear();
            const threeYearsAgo = currentYear - 2; // Misal saat ini 2024, ambil dari tahun 2022

            const countPerYear = {};
            let totalCount = 0;

            // Query untuk mendapatkan data count per tahun
            for (let year = threeYearsAgo; year <= currentYear; year++) {
                const count = await Layananformnum.count({
                    where: {
                        createdAt: {
                            [Op.between]: [`${year}-01-01`, `${year}-12-31`],
                        },
                    },
                });

                countPerYear[year] = count;
                totalCount += count;
            }

            const dataget = {
                countperyear: countPerYear,
                totalcount: totalCount,
            };

            res.status(200).json(response(200, 'success get data', dataget));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

}