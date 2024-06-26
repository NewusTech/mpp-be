const { response } = require('../helpers/response.formatter');

const { Surveyformnum, Layananformnum, Instansi, Layanan } = require('../models');
const { generatePagination } = require('../pagination/pagination');
const { Op } = require('sequelize');

module.exports = {

    //mendapatkan semua data instansi
    get_statistik: async (req, res) => {
        try {
            // Ambil data untuk 3 tahun terakhir
            const currentYear = new Date().getFullYear();
            const threeYearsAgo = currentYear - 2;

            const countPerYear = {};
            let total3year = 0;

            const { month } = req.query;
            const startDate = new Date(currentYear, month ? month - 1 : 0, 1);
            const endDate = new Date(currentYear, month ? month : 12, 0, 23, 59, 59);

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            for (let year = threeYearsAgo; year <= currentYear; year++) {
                const count = await Layananformnum.count({
                    where: {
                        createdAt: {
                            [Op.between]: [`${year}-01-01`, `${year}-12-31`],
                        },
                    },
                });

                countPerYear[year] = count;
                total3year += count;
            }

            let countbyInstansi;
            let totalCount;

            [countbyInstansi, totalCount] = await Promise.all([ 
                Instansi.findAll({
                    include: [{
                        model: Layanan,
                        as: 'Layanans',
                        include: [
                            {
                                model: Layananformnum,
                                as: 'Layananformnums',
                                attributes: ['id'],
                                where: {
                                    createdAt: { [Op.between]: [startDate, endDate] }
                                },
                                required: false
                            },
                            {
                                model: Surveyformnum,
                                as: 'Surveyformnums',
                                attributes: ['id'],
                                where: {
                                    createdAt: { [Op.between]: [startDate, endDate] }
                                },
                                required: false
                            }
                        ],
                        attributes: ['id', 'name'],
                    }],
                    where: {
                        deletedAt: null
                    },
                    limit: limit,
                    offset: offset,
                    attributes: ['id', 'name'],
                    order: [['id', 'ASC']]
                }),
                Instansi.count()
            ]);

            const formattedCountByInstansi = countbyInstansi.map(instansi => ({
                id: instansi.id,
                name: instansi.name,
                permohonan_count: instansi.Layanans.reduce((total, layanan) => total + layanan.Layananformnums.length, 0),
                skm_count: instansi.Layanans.reduce((total, layanan) => total + layanan.Surveyformnums.length, 0),
            }));

            const pagination = generatePagination(totalCount, page, limit, '/api/statistik');

            const dataget = {
                countPerYear,
                total3year,
                formattedCountByInstansi,
                pagination
            };

            res.status(200).json(response(200, 'success get data', dataget));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

}