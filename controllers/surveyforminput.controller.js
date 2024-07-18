const { response } = require('../helpers/response.formatter');

const { Surveyforminput, Surveyformnum, Surveyform, Layanan, Userinfo, sequelize, Instansi } = require('../models');
require('dotenv').config()
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const moment = require('moment-timezone');
const puppeteer = require('puppeteer');
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
                    pendidikan: data.Userinfo ? data.Userinfo.pendidikan : null,
                    gender: data.Userinfo ? data.Userinfo.gender : null
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

}