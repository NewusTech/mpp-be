const { response } = require('../helpers/response.formatter');

const { Instansi, Layanan, Layananformnum, Surveyformnum, Userinfo, Antrian } = require('../models');
const { generatePagination } = require('../pagination/pagination');
const { Op } = require('sequelize');

module.exports = {

    //mendapatkan semua data instansi
    web_user: async (req, res) => {
        try {
            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            const endOfDay = new Date(today.setHours(23, 59, 59, 999));

            const antrianCountToday = await Antrian.count({});

            const permohonanCountToday = await Layananformnum.count({
                // where: {
                //     createdAt: {
                //         [Op.between]: [startOfDay, endOfDay]
                //     }
                // }
            });
            const instansiCount = await Instansi.count({
                where: {
                    status: true
                }
            });
            const layananCount = await Layanan.count({
                where: {
                    status: true
                }
            });

            const dataget = {
                instansiCount,
                layananCount,
                permohonanCountToday,
                antrianCountToday
            };

            res.status(200).json(response(200, 'success get data', dataget));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    web_superadmin: async (req, res) => {
        try {
            const { year, instansi_id, start_date, end_date, search, page, limit } = req.query;

            // Default values or parsing parameters
            const currentYear = parseInt(year) || new Date().getFullYear();
            const pageNumber = parseInt(page) || 1;
            const pageSize = parseInt(limit) || 10;
            const offset = (pageNumber - 1) * pageSize;

            // Function to get last six months
            const getLastSixMonths = (year) => {
                const months = [];
                for (let i = 5; i >= 0; i--) {
                    const startDate = new Date(year, new Date().getMonth() - i, 1);
                    const endDate = new Date(year, new Date().getMonth() - i + 1, 0);
                    months.push({ startDate, endDate });
                }
                return months;
            };

            // Fetch monthly counts for permohonan and skm for the last six months
            const lastSixMonths = getLastSixMonths(currentYear);
            const monthlyCounts = await Promise.all(lastSixMonths.map(async ({ startDate, endDate }) => {
                const monthName = startDate.toLocaleString('default', { month: 'long' });
                const permohonanCount = await Layananformnum.count({
                    where: {
                        createdAt: { [Op.between]: [startDate, endDate] }
                    }
                });
                const skmCount = await Surveyformnum.count({
                    where: {
                        createdAt: { [Op.between]: [startDate, endDate] }
                    }
                });
                return { month: monthName, permohonanCount, skmCount };
            }));

            // Fetch counts by Instansi
            const countbyInstansi = await Instansi.findAll({
                include: [{
                    model: Layanan,
                    as: 'Layanans',
                    include: [{
                        model: Layananformnum,
                        as: 'Layananformnums',
                        attributes: ['id'],
                        where: {
                            createdAt: { [Op.between]: [new Date(currentYear, 0, 1), new Date(currentYear, 11, 31, 23, 59, 59)] }
                        }
                    }],
                    attributes: ['id', 'name'],
                }],
                where: {
                    deletedAt: null
                },
                attributes: ['id', 'name'],
            });

            const formattedCountByInstansi = countbyInstansi.map(instansi => ({
                id: instansi.id,
                name: instansi.name,
                layananformnum_count: instansi.Layanans.reduce((total, layanan) => total + layanan.Layananformnums.length, 0),
            }));

            // Fetch Layanan data with optional filters for instansi_id, start_date, end_date, and search
            const whereClause = {};
            if (search) {
                whereClause.name = { [Op.iLike]: `%${search}%` };
            }
            const whereClause2 = {};
            if (instansi_id) {
                whereClause.instansi_id = instansi_id;
            }
            if (start_date && end_date) {
                whereClause2.createdAt = { [Op.between]: [new Date(start_date), new Date(end_date)] };
            } else if (start_date) {
                whereClause2.createdAt = { [Op.gte]: new Date(start_date) };
            } else if (end_date) {
                whereClause2.createdAt = { [Op.lte]: new Date(end_date) };
            }

            const [permohonanCount, skmCount, layananGets, totalCount] = await Promise.all([
                Layananformnum.count({
                    where: {
                        createdAt: { [Op.between]: [new Date(currentYear, 0, 1), new Date(currentYear, 11, 31, 23, 59, 59)] }
                    }
                }),
                Surveyformnum.count({
                    where: {
                        createdAt: { [Op.between]: [new Date(currentYear, 0, 1), new Date(currentYear, 11, 31, 23, 59, 59)] }
                    }
                }),
                Layanan.findAll({
                    attributes: ['id', 'name', 'createdAt'],
                    where: whereClause,
                    include: [
                        { model: Instansi, attributes: ['id', 'name'], where: whereClause2 },
                        { model: Layananformnum, attributes: ['id'] },
                        { model: Surveyformnum, attributes: ['id'] }
                    ],
                    limit: pageSize,
                    offset: offset
                }),
                Layanan.count({
                    where: whereClause,
                    include: [
                        { model: Instansi, attributes: ['id', 'name'], where: whereClause2 }
                    ],
                })
            ]);

            const modifiedLayananGets = layananGets.map(layanan => {
                const { Instansi } = layanan.dataValues;
                return {
                    id: layanan.id,
                    layanan_name: layanan.name,
                    layanan_createdAt: layanan.createdAt,
                    instansi_id: Instansi.id,
                    instansi_name: Instansi.name,
                    permohonanCount: layanan.Layananformnums.length,
                    skmCount: layanan.Surveyformnums.length
                };
            });

            // Generate pagination
            const pagination = generatePagination(totalCount, pageNumber, pageSize, '/api/dashboard/superadmin');

            // Construct final response object
            const data = {
                permohonanCount,
                skmCount,
                monthlyCounts,
                countbyInstansi: formattedCountByInstansi,
                layananData: modifiedLayananGets,
                pagination
            };

            res.status(200).json(response(200, 'success get data', data));

        } catch (err) {
            console.error(err);
            res.status(500).json(response(500, 'internal server error', err));
        }
    },

    web_admin: async (req, res) => {
        try {

            const { month } = req.query;
            const today = new Date();
            const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7));
            const queryMonth = month ? parseInt(month, 10) - 1 : today.getMonth();
            const queryYear = today.getFullYear();
            const firstDayOfMonth = new Date(queryYear, queryMonth, 1);
            const lastDayOfMonth = new Date(queryYear, queryMonth + 1, 0, 23, 59, 59, 999);
            const dateRangeMonth = [firstDayOfMonth, lastDayOfMonth];

            const firstDaythisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDaythisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

            const dateRangethisMonth = [firstDaythisMonth, lastDaythisMonth];

            const dateRangeToday = [new Date().setHours(0, 0, 0, 0), new Date().setHours(23, 59, 59, 999)];
            const dateRangeWeek = [sevenDaysAgo, new Date()];

            const instansiWhere = { instansi_id: data.instansi_id };

            const datainstansi = await Instansi.findAll({
                where: { id: data.instansi_id },
                attributes: ['id', 'name', 'desc', 'image'],
            })

            const counts = await Promise.all([
                Layananformnum.count({ where: { createdAt: { [Op.between]: dateRangeToday } }, include: { model: Layanan, attributes: ['id'], where: instansiWhere } }),
                Layananformnum.count({ where: { createdAt: { [Op.between]: dateRangeToday }, status: 4 }, include: { model: Layanan, attributes: ['id'], where: instansiWhere } }),
                Layananformnum.count({ where: { createdAt: { [Op.between]: dateRangeMonth } }, include: { model: Layanan, attributes: ['id'], where: instansiWhere } }),
                Layananformnum.count({ where: { createdAt: { [Op.between]: dateRangeMonth }, status: 4 }, include: { model: Layanan, attributes: ['id'], where: instansiWhere } }),
                Userinfo.count(),
            ]);

            const getTopLayanan = async (range) => {
                const layanan = await Layanan.findAll({
                    where: instansiWhere,
                    include: {
                        model: Layananformnum,
                        attributes: ['id'],
                        required: false,
                        where: { createdAt: { [Op.between]: range } },
                    },
                });

                return layanan
                    .map(l => ({ LayananId: l.id, LayananName: l.name, LayananformnumCount: l.Layananformnums.length }))
                    .sort((a, b) => b.LayananformnumCount - a.LayananformnumCount)
                    .slice(0, 3);
            };

            const [top3LayananMonth, top3LayananWeek] = await Promise.all([
                getTopLayanan(dateRangethisMonth),
                getTopLayanan(dateRangeWeek),
            ]);

            res.status(200).json(response(200, 'success get data', {
                datainstansi,
                permohonanCountToday: counts[0],
                permohonanGagalToday: counts[1],
                permohonanCountMonth: counts[2],
                permohonanGagalMonth: counts[3],
                UserCount: counts[4],
                top3LayananMonth,
                top3LayananWeek,
            }));

        } catch (err) {
            console.error(err);
            res.status(500).json(response(500, 'internal server error', err));
        }
    },

}