const { response } = require('../helpers/response.formatter');

const { Surveyforminput, Surveyformnum, Surveyform, Layanan, Userinfo, sequelize, Instansi } = require('../models');
require('dotenv').config()
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const moment = require('moment-timezone');
const puppeteer = require('puppeteer');
const { generatePagination } = require('../pagination/pagination');

const pendidikanList = [
    { id: 1, key: 'Tidak Sekolah' },
    { id: 2, key: 'SD' },
    { id: 3, key: 'SMP' },
    { id: 4, key: 'SMA' },
    { id: 5, key: 'D1' },
    { id: 6, key: 'D2' },
    { id: 7, key: 'D3' },
    { id: 8, key: 'S1' },
    { id: 9, key: 'S2' },
    { id: 10, key: 'S3' }
  ];
  
  const getPendidikanKey = (id) => {
    const found = pendidikanList.find(p => p.id === id);
    return found ? found.key : 'Unknown';
  };
  
  const getGenderKey = (id) => {
    return id === 1 ? 'Laki-Laki' : id === 2 ? 'Perempuan' : 'Unknown';
  };

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

            let dataLayanan = await Layanan.findOne({
                where: {
                    id: idlayanan
                },
                include: [
                    {
                        model: Instansi,
                        attributes: ['name', 'code']
                    },
                ],
                attributes: ['id', 'code'],
            });

            const count = await Surveyformnum.count({
                where: {
                    layanan_id: idlayanan
                }
            });

            const urut = String(count + 1).padStart(1, '0');
            const no_skm = `SKM${dataLayanan?.Instansi?.code}-${dataLayanan?.code}${urut}`;

            let layananID = {
                no_skm: no_skm,
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
            res.status(201).json(response(201, 'Success create', createdSurveyforminput));
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
                        attributes: ['kritiksaran', 'no_skm', 'date'],
                        include: [
                            {
                                model: Layanan,
                                attributes: ['id', 'name'],
                                include: [
                                    {
                                        model: Instansi,
                                        attributes: ['id', 'name'],
                                    },
                                ]
                            },
                        ]
                    }
                ]
            });

            if (!inputsurveyData || inputsurveyData?.length < 1) {
                res.status(404).json(response(404, 'data not found'));
                return;
            }

            // Assuming all records will have the same 'kritiksaran' since they share 'surveyformnum_id'
            const kritiksaran = inputsurveyData[0]?.Surveyformnum?.kritiksaran;
            const no_skm = inputsurveyData[0]?.Surveyformnum?.no_skm;
            const date = inputsurveyData[0]?.Surveyformnum?.date;
            const layanan_name = inputsurveyData[0]?.Surveyformnum?.Layanan?.name;
            const instansi_name = inputsurveyData[0]?.Surveyformnum?.Layanan?.Instansi?.name;

            let formatteddata = inputsurveyData.map(datafilter => {
                return {
                    id: datafilter?.id,
                    nilai: datafilter?.nilai,
                    surveyform_id: datafilter?.surveyform_id,
                    surveyformnum_id: datafilter?.surveyformnum_id,
                    surveyform_name: datafilter?.Surveyform?.field,
                };
            });

            res.status(200).json(response(200, 'success get data', { instansi_name, layanan_name, kritiksaran, no_skm, date, formatteddata }));
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
            const start_date = req.query.start_date;
            const end_date = req.query.end_date;
            let history;
            let totalCount;

            const WhereClause = {};
            if (instansi_id) {
                WhereClause.instansi_id = instansi_id;
            }
            if (start_date && end_date) {
                WhereClause.createdAt = {
                    [Op.between]: [moment(start_date).startOf('day').toDate(), moment(end_date).endOf('day').toDate()]
                };
            } else if (start_date) {
                WhereClause.createdAt = {
                    [Op.gte]: moment(start_date).startOf('day').toDate()
                };
            } else if (end_date) {
                WhereClause.createdAt = {
                    [Op.lte]: moment(end_date).endOf('day').toDate()
                };
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
                    offset: offset,
                    order: [['id', 'DESC']]
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
                    Surveyformnums_nilai: surveyformnumsNilai,
                    created_at: data.createdAt
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

    gethistoryforuser: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            let { start_date, end_date, search } = req.query;

            let history;
            let totalCount;

            const WhereClause = {};

            WhereClause.userinfo_id = data.userId

            if (search) {
                WhereClause[Op.or] = [
                    { '$Layanan.name$': { [Op.iLike]: `%${search}%` } },
                    { '$Layanan.Instansi.name$': { [Op.iLike]: `%${search}%` } }
                ];
            }

            if (start_date && end_date) {
                WhereClause.createdAt = {
                    [Op.between]: [moment(start_date).startOf('day').toDate(), moment(end_date).endOf('day').toDate()]
                };
            } else if (start_date) {
                WhereClause.createdAt = {
                    [Op.gte]: moment(start_date).startOf('day').toDate()
                };
            } else if (end_date) {
                WhereClause.createdAt = {
                    [Op.lte]: moment(end_date).endOf('day').toDate()
                };
            }

            [history, totalCount] = await Promise.all([
                Surveyformnum.findAll({
                    where: WhereClause,
                    limit: limit,
                    offset: offset,
                    order: [['id', 'DESC']],
                    include: [
                        {
                            model: Layanan,
                            attributes: ['name'],
                            include: [
                                {
                                    model: Instansi,
                                    attributes: ['name']
                                }
                            ],
                        }
                    ],
                }),
                Surveyformnum.count({
                    where: WhereClause,
                    include: [
                        {
                            model: Layanan,
                            attributes: ['name'],
                            include: [
                                {
                                    model: Instansi,
                                    attributes: ['name']
                                }
                            ],
                        }
                    ],
                })
            ]);

            const transformedHistory = history.map(item => ({
                id: item.id,
                no_skm: item.no_skm,
                userinfo_id: item.userinfo_id,
                layanan_id: item.layanan_id,
                date: item.date,
                kritiksaran: item.kritiksaran,
                createdAt: item?.createdAt,
                updatedAt: item?.updatedAt,
                layanan_name: item?.Layanan?.name,
                instansi_name: item?.Layanan?.Instansi?.name
            }));

            const pagination = generatePagination(totalCount, page, limit, `/api/user/userhistorysurvey`);

            res.status(200).json({
                status: 200,
                message: 'success get',
                data: transformedHistory,
                pagination: pagination
            });

        } catch (err) {
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

    getPDFhistorysurveyuser: async (req, res) => {
        try {
            const instansi_id = Number(req.query.instansi_id);
            let history;
            let totalCount;
            const start_date = req.query.start_date;
            const end_date = req.query.end_date;

            const WhereClause = {};
            if (instansi_id) {
                WhereClause.instansi_id = instansi_id;
            }
            if (start_date && end_date) {
                WhereClause.createdAt = {
                    [Op.between]: [moment(start_date).startOf('day').toDate(), moment(end_date).endOf('day').toDate()]
                };
            } else if (start_date) {
                WhereClause.createdAt = {
                    [Op.gte]: moment(start_date).startOf('day').toDate()
                };
            } else if (end_date) {
                WhereClause.createdAt = {
                    [Op.lte]: moment(end_date).endOf('day').toDate()
                };
            }

            [history, totalCount] = await Promise.all([
                Layanan.findAll({
                    include: [{
                        model: Surveyformnum,
                        include: [{
                            model: Surveyforminput,
                        }],
                    }],
                    where: WhereClause
                }),
                Layanan.count({
                    where: WhereClause,
                })
            ]);

            const nilaiMap = { 1: 30, 2: 60, 3: 80, 4: 100 };

            const calculateNilai = (surveyformnums) => {
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

            // Generate HTML content for PDF
            const templatePath = path.resolve(__dirname, '../views/surveybyinstansi.html');
            let htmlContent = fs.readFileSync(templatePath, 'utf8');
            let instansiGet;

            if (instansi_id) {
                instansiGet = await Instansi.findOne({
                    where: {
                        id: instansi_id
                    }
                });
            }

            const instansiInfo = instansiGet?.name ? `<p>Instansi : ${instansiGet?.name}</p>` : '';

            const reportTableRows = formattedData.map(survey => `
                <tr>
                    <td>${survey.layanan_name}</td>
                    <td class="center">${survey.Surveyformnums_count}</td>
                    <td class="center">${survey.Surveyformnums_nilai}</td>
                </tr>
            `).join('');

            htmlContent = htmlContent.replace('{{instansiInfo}}', instansiInfo);
            htmlContent = htmlContent.replace('{{reportTableRows}}', reportTableRows);

            // Launch Puppeteer
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();

            // Set HTML content
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

            // Generate PDF
            const pdfBuffer = await page.pdf({
                format: 'A4',
                margin: {
                    top: '1.16in',
                    right: '1.16in',
                    bottom: '1.16in',
                    left: '1.16in'
                }
            });

            await browser.close();

            // Generate filename
            const currentDate = new Date().toISOString().replace(/:/g, '-');
            const filename = `laporan-${currentDate}.pdf`;

            // Send PDF buffer
            res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
            res.setHeader('Content-type', 'application/pdf');
            res.send(pdfBuffer);

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
            let layanan;
            let history;
            let totalCount;
            const start_date = req.query.start_date;
            const end_date = req.query.end_date;

            const WhereClause = {};
            if (idlayanan) {
                WhereClause.layanan_id = idlayanan;
            }
            if (start_date && end_date) {
                WhereClause.createdAt = {
                    [Op.between]: [moment(start_date).startOf('day').toDate(), moment(end_date).endOf('day').toDate()]
                };
            } else if (start_date) {
                WhereClause.createdAt = {
                    [Op.gte]: moment(start_date).startOf('day').toDate()
                };
            } else if (end_date) {
                WhereClause.createdAt = {
                    [Op.lte]: moment(end_date).endOf('day').toDate()
                };
            }

            [layanan, history, totalCount] = await Promise.all([
                Layanan.findOne({
                    where: {
                        id: idlayanan
                    },
                    attributes: ['id', 'name'],
                }),
                Surveyformnum.findAll({
                    include: [
                        {
                            model: Surveyforminput,
                        },
                        {
                            model: Userinfo,
                            attributes: ['id', 'name', 'pendidikan', 'gender'],
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
                    kritiksaran: data.kritiksaran,
                    nilai: surveyforminputsNilai,
                    name: data.Userinfo ? data.Userinfo.name : null,
                    pendidikan: data.Userinfo ? data.Userinfo.pendidikan : null,
                    gender: data.Userinfo ? data.Userinfo.gender : null
                };
            });

            const pagination = generatePagination(totalCount, page, limit, `/api/user/historysurvey/${idlayanan}`);

            res.status(200).json({
                status: 200,
                message: 'success get',
                data: formattedData,
                layanan: layanan,
                pagination: pagination
            });

        } catch (err) {
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

    getPDFsurveybylayanan: async (req, res) => {
        try {
            const idlayanan = Number(req.params.idlayanan);
            let history;
            const start_date = req.query.start_date;
            const end_date = req.query.end_date;
    
            const WhereClause = {};
            if (idlayanan) {
                WhereClause.layanan_id = idlayanan;
            }
            if (start_date && end_date) {
                WhereClause.createdAt = {
                    [Op.between]: [moment(start_date).startOf('day').toDate(), moment(end_date).endOf('day').toDate()]
                };
            } else if (start_date) {
                WhereClause.createdAt = {
                    [Op.gte]: moment(start_date).startOf('day').toDate()
                };
            } else if (end_date) {
                WhereClause.createdAt = {
                    [Op.lte]: moment(end_date).endOf('day').toDate()
                };
            }
    
            [history, totalCount] = await Promise.all([
                Surveyformnum.findAll({
                    include: [
                        {
                            model: Surveyforminput,
                        },
                        {
                            model: Userinfo,
                            attributes: ['id', 'name', 'pendidikan', 'gender'],
                        },
                    ],
                    where: WhereClause
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
    
            let totalNilaiAll = 0;
            let totalEntries = 0;
    
            const formatTanggal = (tanggal) => {
                const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                const dateObj = new Date(tanggal);
                const hari = dateObj.getDate();
                const bulanFormatted = bulan[dateObj.getMonth()];
                const tahun = dateObj.getFullYear();
    
                return `${hari} ${bulanFormatted} ${tahun}`;
            };
    
            let formattedData = history.map(data => {
                const surveyforminputsNilai = data.Surveyforminputs ? calculateNilai(data.Surveyforminputs) : 0;
    
                totalNilaiAll += surveyforminputsNilai;
                totalEntries++;
    
                return {
                    id: data.id,
                    date: formatTanggal(data.date),
                    kritiksaran: data.kritiksaran,
                    nilai: surveyforminputsNilai,
                    name: data.Userinfo ? data.Userinfo.name : null,
                    pendidikan: data.Userinfo ? getPendidikanKey(data.Userinfo.pendidikan) : null,
                    gender: data.Userinfo ? getGenderKey(data.Userinfo.gender) : null
                };
            });
    
            const total_nilai = totalEntries > 0 ? (totalNilaiAll / totalEntries).toFixed(2) : 0;
    
            // Generate HTML content for PDF
            const templatePath = path.resolve(__dirname, '../views/surveybylayanan.html');
            let htmlContent = fs.readFileSync(templatePath, 'utf8');
            let layananGet;
    
            if (idlayanan) {
                layananGet = await Layanan.findOne({
                    where: {
                        id: idlayanan
                    },
                    include: [{ model: Instansi, attributes: ['id', 'name'] }],
                });
            }
    
            const instansiInfo = layananGet?.Instansi?.name ? `<p>Instansi : ${layananGet?.Instansi?.name}</p>` : '';
            const layananInfo = layananGet?.name ? `<p>Layanan : ${layananGet?.name}</p>` : '';
    
            const reportTableRows = formattedData.map(survey => `
                <tr>
                    <td>${survey.date}</td>
                    <td>${survey.name}</td>
                    <td>${survey.pendidikan}</td>
                    <td>${survey.gender}</td>
                    <td>${survey.kritiksaran}</td>
                    <td class="center">${survey.nilai}</td>
                </tr>
            `).join('');
    
            htmlContent = htmlContent.replace('{{layananInfo}}', layananInfo);
            htmlContent = htmlContent.replace('{{instansiInfo}}', instansiInfo);
            htmlContent = htmlContent.replace('{{reportTableRows}}', reportTableRows);
            htmlContent = htmlContent.replace('{{total_nilai}}', total_nilai);
    
            // Launch Puppeteer
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
    
            // Set HTML content
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
            // Generate PDF
            const pdfBuffer = await page.pdf({
                format: 'A4',
                margin: {
                    top: '1.16in',
                    right: '1.16in',
                    bottom: '1.16in',
                    left: '1.16in'
                }
            });
    
            await browser.close();
    
            // Generate filename
            const currentDate = new Date().toISOString().replace(/:/g, '-');
            const filename = `laporan-${currentDate}.pdf`;
    
            // Send PDF buffer
            res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
            res.setHeader('Content-type', 'application/pdf');
            res.send(pdfBuffer);
    
        } catch (err) {
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

    getCheckUserSKM: async (req, res) => {
        const { id_layanan } = req.params;
        const id_user = data?.user_akun_id;

        if (!id_user || !id_layanan) {
            return res.status(400).json({ message: 'Bad Request: Missing required parameters' });
        }

        try {
            const survey = await Surveyformnum.findOne({
                where: {
                    userinfo_id: id_user,
                    layanan_id: id_layanan,
                },
                attributes: ['id']
            });

            if (survey) {
                res.status(700).json({
                    status: 700,
                    message: 'Sudah pernah input survey pada layanan ini',
                });
            } else {
                res.status(200).json({
                    status: 200,
                    message: 'Sukses',
                });
            }
        } catch (err) {
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

    statistikSKM_foruser: async (req, res) => {
        try {

            const WhereClause = {};

            const WhereClause2 = {};

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

            history.map(data => {
                // const surveyformnumsCount = data.Surveyformnums ? data.Surveyformnums.length : 0;
                const surveyformnumsNilai = data.Surveyformnums ? calculateNilai(data.Surveyformnums) : 0;

                if (surveyformnumsNilai > 0) {
                    totalNilai += surveyformnumsNilai;
                    totalLayanan++;
                }

                return {
                    id: data.id,
                    layanan_name: data.name || null
                };
            });

            const rataRataNilaiSKM = totalLayanan > 0 ? totalNilai / totalLayanan : 0;

            res.status(200).json(response(200, 'success get data', {
                rataRataNilaiSKM,
            }));

        } catch (err) {
            console.error(err);
            res.status(500).json(response(500, 'internal server error', err));
        }
    },

}