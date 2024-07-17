const { response } = require('../helpers/response.formatter');

const { Instansi, Layanan, Layananformnum, Surveyforminput, Surveyformnum, Userinfo, Antrian } = require('../models');
const { generatePagination } = require('../pagination/pagination');
const { Op } = require('sequelize');
const moment = require('moment-timezone');

module.exports = {

    //mendapatkan semua data instansi
    web_user: async (req, res) => {
        try {
            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            const endOfDay = new Date(today.setHours(23, 59, 59, 999));

            const antrianCountToday = await Antrian.count({
                where: {
                    createdAt: {
                        [Op.between]: [startOfDay, endOfDay]
                    }
                }
            });

            const permohonanCountToday = await Layananformnum.count({
                where: {
                    createdAt: {
                        [Op.between]: [startOfDay, endOfDay]
                    }
                }
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

    web_admin_layanan: async (req, res) => {
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

    web_admin_survey: async (req, res) => {
        try {

            const { year } = req.query;

            const datainstansi = await Instansi.findAll({
                where: { id: data.instansi_id },
                attributes: ['id', 'name', 'desc', 'image'],
            })

            const WhereClause = {};
            WhereClause.instansi_id = data?.instansi_id;

            const WhereClause2 = {};

            if (year) {
                const startDate = new Date(year, 0, 1);
                const endDate = new Date(year, 11, 31);
                WhereClause2.createdAt = {
                    [Op.between]: [startDate, endDate]
                };
            }

            [history, totalCount] = await Promise.all([
                Layanan.findAll({
                    include: [{
                        model: Surveyformnum,
                        required: false,
                        include: [{
                            model: Surveyforminput,
                        }],
                        where: WhereClause2,
                    }],
                    where: WhereClause,
                })
            ]);

            const calculateNilai = (surveyformnums) => {
                const nilaiMap = { 1: 30, 2: 60, 3: 80, 4: 100 };
                let totalNilai = 0;
                let totalInputs = 0;

                surveyformnums.forEach(surveyformnum => {
                    surveyformnum.Surveyforminputs.forEach(input => {
                        totalNilai += nilaiMap[input.nilai] || 0;
                        totalInputs++;
                    });
                });

                return totalInputs > 0 ? totalNilai / totalInputs : 0;
            };

            let totalNilai = 0;
            let totalLayanan = 0;

            let nilaiSKM_perlayanan = history.map(data => {
                // const surveyformnumsCount = data.Surveyformnums ? data.Surveyformnums.length : 0;
                const surveyformnumsNilai = data.Surveyformnums ? calculateNilai(data.Surveyformnums) : 0;

                if (surveyformnumsNilai > 0) {
                    totalNilai += surveyformnumsNilai;
                    totalLayanan++;
                }

                return {
                    id: data.id,
                    layanan_name: data.name || null,
                    // Surveyformnums_count: surveyformnumsCount,
                    Surveyformnums_nilai: surveyformnumsNilai
                };
            });

            const rataRataNilaiSKM = totalLayanan > 0 ? totalNilai / totalLayanan : 0;

            const surveyformnumPerBulan = Array.from({ length: 12 }, (_, i) => ({
                month: i + 1,
                total: 0
            }));

            history.forEach(data => {
                data.Surveyformnums.forEach(surveyformnum => {
                    const bulan = new Date(surveyformnum.createdAt).getMonth();
                    surveyformnumPerBulan[bulan].total++;
                });
            });

            res.status(200).json(response(200, 'success get data', {
                datainstansi,
                nilaiSKM_perlayanan,
                rataRataNilaiSKM,
                surveyformnumPerBulan
            }));

        } catch (err) {
            console.error(err);
            res.status(500).json(response(500, 'internal server error', err));
        }
    },

    web_admin_antrian: async (req, res) => {
        try {
            const iddinas = data.instansi_id;
            const yearParam = req.query.year;
            const currentYear = yearParam ? parseInt(yearParam) : moment().year();

            const createCountPromises = (month) => {
                const startOfMonth = moment().year(currentYear).month(month).startOf('month').toDate();
                const endOfMonth = moment().year(currentYear).month(month).endOf('month').toDate();
                return Antrian.count({
                    where: {
                        createdAt: { [Op.between]: [startOfMonth, endOfMonth] },
                        instansi_id: iddinas
                    }
                });
            };

            const createPermohonanPromises = (month) => {
                const startOfMonth = moment().year(currentYear).month(month).startOf('month').toDate();
                const endOfMonth = moment().year(currentYear).month(month).endOf('month').toDate();
                return Layananformnum.count({
                    include: [{
                        model: Layanan,
                        attributes: { exclude: ['name'] },
                        where: { instansi_id: iddinas }
                    }],
                    where: {
                        createdAt: { [Op.between]: [startOfMonth, endOfMonth] },
                    }
                });
            };

            const months = Array.from({ length: 12 }, (_, month) => month);

            const [AntrianmonthlyCounts, PermohonanmonthlyCounts] = await Promise.all([
                Promise.all(months.map(createCountPromises)),
                Promise.all(months.map(createPermohonanPromises))
            ]);

            const formatMonthlyData = (counts) =>
                months.reduce((acc, month, idx) => {
                    acc[moment().month(month).format('MMMM')] = counts[idx];
                    return acc;
                }, {});

            res.status(200).json({
                status: 200,
                message: 'success get',
                data: {
                    antrianperBulan: formatMonthlyData(AntrianmonthlyCounts),
                    permohonanperBulan: formatMonthlyData(PermohonanmonthlyCounts)
                }
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: 'internal server error', error: err });
        }
    },

    web_admlayanan: async (req, res) => {
        try {

            const idlayanan = data.layanan_id
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const { status, code, range, start_date, end_date } = req.query;

            const startOfToday = moment().startOf('day').toDate();
            const endOfToday = moment().endOf('day').toDate();

            let startOfToday2;
            let endOfToday2;

            if (range == 'today') {
                startOfToday2 = moment().startOf('day').toDate();
                endOfToday2 = moment().endOf('day').toDate();
            } else {
                if (start_date && end_date) {
                    startOfToday2 = moment(start_date).startOf('day').toDate();
                    endOfToday2 = moment(end_date).endOf('day').toDate();
                } else if (start_date) {
                    startOfToday2 = moment(start_date).startOf('day').toDate();
                    endOfToday2 = moment('2080-01-01').endOf('day').toDate();
                } else if (end_date) {
                    startOfToday2 = moment('2010-01-01').startOf('day').toDate();
                    endOfToday2 = moment(end_date).endOf('day').toDate();
                } else {
                    startOfToday2 = moment('2010-01-01').startOf('day').toDate();
                    endOfToday2 = moment('2080-01-01').endOf('day').toDate();
                }
            }

            const [AntrianCount, AntrianSebelumnya, AntrianNext, riwayatAntrian, riwayatCount] = await Promise.all([
                Antrian.count({
                    where: {
                        createdAt: { [Op.between]: [startOfToday, endOfToday] },
                        layanan_id: idlayanan
                    },
                }),
                Antrian.findOne({
                    where: {
                        createdAt: { [Op.between]: [startOfToday, endOfToday] },
                        status: true,
                        layanan_id: idlayanan
                    },
                    order: [['id', 'DESC']]
                }),
                Antrian.findAll({
                    where: {
                        createdAt: { [Op.between]: [startOfToday, endOfToday] },
                        status: false,
                        layanan_id: idlayanan,
                    },
                    limit: 2,
                    order: [['id', 'ASC']]
                }),
                Antrian.findAll({
                    where: {
                        createdAt: {
                            [Op.between]: [startOfToday2, endOfToday2],
                        },
                        ...(status && { status: status }),
                        ...(code && { code: { [Op.like]: `%${code}%` } }),
                    },
                    include: [{
                        model: Layanan,
                        attributes: ['name'],
                        where: {
                            id: idlayanan,
                        },
                    }],
                    order: [['id', 'ASC']],
                    limit: limit,
                    offset: offset
                }),
                Antrian.count(
                    {
                        where: {
                            createdAt: {
                                [Op.between]: [startOfToday2, endOfToday2],
                            },
                            ...(status && { status: status }),
                            ...(code && { code: { [Op.like]: `%${code}%` } }),
                        },
                        include: [{
                            model: Layanan,
                            where: {
                                id: idlayanan,
                            },
                        }]
                    }
                )
            ]);

            const pagination = generatePagination(riwayatCount, page, limit, `/api/dashboard/adminlayanan`);

            const dataget = {
                AntrianCount,
                AntrianSebelumnya: AntrianSebelumnya?.code ?? null,
                AntrianProses: AntrianNext[0]?.code ?? null,
                AntrianNext: AntrianNext[1]?.code ?? null,
                riwayatAntrian,
                pagination: pagination
            };

            res.status(200).json({
                status: 200,
                message: 'success get',
                data: dataget
            });

        } catch (err) {
            console.error(err);
            res.status(500).json(response(500, 'internal server error', err));
        }
    },

}