const { response } = require('../helpers/response.formatter');

const { Surveyforminput, Surveyformnum, Surveyform, Layanan, Userinfo, sequelize } = require('../models');
require('dotenv').config()

const { generatePagination } = require('../pagination/pagination');

module.exports = {

    //input survey user
    inputsurvey: async (req, res) => {
        const transaction = await sequelize.transaction();

        try {

            const idlayanan = req.params.idlayanan;
            const iduser = data.userId;

            if (!iduser) {
                throw new Error('User ID is required');
            }

            const { datainput } = req.body;

            let layananID = {
                userinfo_id: Number(iduser),
                layanan_id: Number(idlayanan),
                date: req.body.date ?? null,
                kritiksaran: req.body.kritiksaran ?? null
            };

            const createdSurveyformnum = await Surveyformnum.create(layananID, { transaction });

            const updatedDatainput = datainput.map(item => ({
                ...item,
                surveyformnum_id: createdSurveyformnum.id
            }));

            const createdSurveyforminput = await Surveyforminput.bulkCreate(updatedDatainput, { transaction });

            await transaction.commit();
            res.status(201).json(response(201, 'Success create', createdSurveyforminput ));
        } catch (err) {
            await transaction.rollback();
            res.status(500).json(response(500, 'Internal server error', err));
            console.error(err);
        }
    },

    //get survey form user
    getdetailsurveyform: async (req, res) => {
        try {
            const idsurveynum = req.params.idsurveynum;
    
            let inputsurveyData = await Surveyforminput.findAll({
                where: {
                    surveyformnum_id: idsurveynum
                },
                include: [
                    {
                        model: Surveyform,
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                    },
                    {
                        model: Surveyformnum,
                        attributes: ['kritiksaran'],
                    }
                ]
            });
    
            if (!inputsurveyData || inputsurveyData.length < 1) {
                res.status(404).json(response(404, 'data not found'));
                return;
            }
    
            // Assuming all records will have the same 'kritiksaran' since they share 'surveyformnum_id'
            const kritiksaran = inputsurveyData[0].Surveyformnum.kritiksaran;
    
            let formatteddata = inputsurveyData.map(datafilter => {
                return {
                    id: datafilter.id,
                    nilai: datafilter.nilai,
                    surveyform_id: datafilter.surveyform_id,
                    surveyformnum_id: datafilter.surveyformnum_id,
                    surveyform_name: datafilter.Surveyform.field,
                };
            });
    
            res.status(200).json(response(200, 'success get data', { kritiksaran, formatteddata }));
        } catch (err) {
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

    //get history input survey user
    gethistorysurveyuser: async (req, res) => {
        try {
            const instansi_id = Number(req.query.instansi_id);
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            let history;
            let totalCount;
    
            const WhereClause = {};
            if (instansi_id) {
                WhereClause.instansi_id = instansi_id;
            }
    
            [history, totalCount] = await Promise.all([
                Layanan.findAll({
                    include: [{
                        model: Surveyformnum,
                        include: [{
                            model: Surveyforminput,
                        }],
                    }],
                    where: WhereClause,
                    limit: limit,
                    offset: offset
                }),
                Layanan.count({
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
    
            let formattedData = history.map(data => {
                const surveyformnumsCount = data.Surveyformnums ? data.Surveyformnums.length : 0;
                const surveyformnumsNilai = data.Surveyformnums ? calculateNilai(data.Surveyformnums) : 0;
    
                return {
                    id: data.id,
                    layanan_name: data.name || null,
                    Surveyformnums_count: surveyformnumsCount,
                    Surveyformnums_nilai: surveyformnumsNilai
                };
            });
    
            const pagination = generatePagination(totalCount, page, limit, `/api/user/historysurvey`);
    
            res.status(200).json({
                status: 200,
                message: 'success get',
                data: formattedData,
                pagination: pagination
            });
    
        } catch (err) {
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

    //get history survey by layanan
    getsurveybylayanan: async (req, res) => {
        try {
            const idlayanan = Number(req.params.idlayanan);
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            let history;
            let totalCount;
    
            const WhereClause = {};
            if (idlayanan) {
                WhereClause.layanan_id = idlayanan;
            }
    
            [history, totalCount] = await Promise.all([
                Surveyformnum.findAll({
                    include: [
                        {
                            model: Surveyforminput,
                        },
                        {
                            model: Userinfo,
                            attributes: ['id', 'name'],
                        },
                    ],
                    where: WhereClause,
                    limit: limit,
                    offset: offset
                }),
                Surveyformnum.count({
                    where: WhereClause,
                })
            ]);

            const calculateNilai = (surveyforminputs) => {
                const nilaiMap = { 1: 30, 2: 60, 3: 80, 4: 100 };
                let totalNilai = 0;
                let totalInputs = 0;
    
                surveyforminputs.forEach(input => {
                    totalNilai += nilaiMap[input.nilai] || 0;
                    totalInputs++;
                });
    
                return totalInputs > 0 ? totalNilai / totalInputs : 0;
            };
    
            let formattedData = history.map(data => {
                const surveyforminputsNilai = data.Surveyforminputs ? calculateNilai(data.Surveyforminputs) : 0;
    
                return {
                    id: data.id,
                    date: data.date,
                    nilai: surveyforminputsNilai,
                    name: data.Userinfo ? data.Userinfo.name : null
                };
            });
    
            const pagination = generatePagination(totalCount, page, limit, `/api/user/historysurvey/${idlayanan}`);
    
            res.status(200).json({
                status: 200,
                message: 'success get',
                data: formattedData,
                pagination: pagination
            });
    
        } catch (err) {
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

}