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
                layanan_id: Number(idlayanan),
                date: new Date().toISOString().split('T')[0],
                kritiksaran: req.body.kritiksaran ?? null,
                name: req.body.name ?? null,
                email: req.body.email ?? null,
                pekerjaan: req.body.pekerjaan ?? null,
                alamat: req.body.alamat ?? null,
                telepon: req.body.telepon ?? null,
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
                        attributes: ['kritiksaran', 'no_skm', 'date', 'alamat', 'name', 'pekerjaan', 'telepon', 'email'],
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
            const name = inputsurveyData[0]?.Surveyformnum?.name;
            const alamat = inputsurveyData[0]?.Surveyformnum?.alamat;
            const pekerjaan = inputsurveyData[0]?.Surveyformnum?.pekerjaan;
            const email = inputsurveyData[0]?.Surveyformnum?.email;
            const telepon = inputsurveyData[0]?.Surveyformnum?.telepon;
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

            res.status(200).json(response(200, 'success get data', { instansi_name, layanan_name, name, alamat, pekerjaan, email, telepon, kritiksaran, no_skm, date, formatteddata }));
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
                let nilaiPerSurveyform = {};
                let totalSurveyformnum = surveyformnums.length;

                surveyformnums.forEach(surveyformnum => {
                    surveyformnum.Surveyforminputs.forEach(input => {
                        if (!nilaiPerSurveyform[input.surveyform_id]) {
                            nilaiPerSurveyform[input.surveyform_id] = 0;
                        }
                        nilaiPerSurveyform[input.surveyform_id] += input.nilai || 0;
                    });
                });

                for (let surveyform_id in nilaiPerSurveyform) {
                    nilaiPerSurveyform[surveyform_id] = (nilaiPerSurveyform[surveyform_id] / totalSurveyformnum) * 0.11;
                }

                return nilaiPerSurveyform;
            };

            let formattedData = history.map(data => {
                const surveyformnumsCount = data.Surveyformnums ? data.Surveyformnums.length : 0;
                const surveyformnumsNilai = data.Surveyformnums ? calculateNilai(data.Surveyformnums) : 0;

                let totalNilaiPerLayanan = Object.values(surveyformnumsNilai).reduce((sum, nilai) => sum + nilai, 0);

                return {
                    id: data.id,
                    layanan_name: data.name || null,
                    Surveyformnums_count: surveyformnumsCount,
                    Surveyformnums_nilai: totalNilaiPerLayanan * 25,
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

            const calculateNilai = (surveyformnums) => {
                let nilaiPerSurveyform = {};
                let totalSurveyformnum = surveyformnums.length;

                surveyformnums.forEach(surveyformnum => {
                    surveyformnum.Surveyforminputs.forEach(input => {
                        if (!nilaiPerSurveyform[input.surveyform_id]) {
                            nilaiPerSurveyform[input.surveyform_id] = 0;
                        }
                        nilaiPerSurveyform[input.surveyform_id] += input.nilai || 0;
                    });
                });

                for (let surveyform_id in nilaiPerSurveyform) {
                    nilaiPerSurveyform[surveyform_id] = (nilaiPerSurveyform[surveyform_id] / totalSurveyformnum) * 0.11;
                }

                return nilaiPerSurveyform;
            };

            let formattedData = history.map(data => {
                const surveyformnumsCount = data.Surveyformnums ? data.Surveyformnums.length : 0;
                const surveyformnumsNilai = data.Surveyformnums ? calculateNilai(data.Surveyformnums) : 0;

                let totalNilaiPerLayanan = Object.values(surveyformnumsNilai).reduce((sum, nilai) => sum + nilai, 0);

                return {
                    id: data.id,
                    layanan_name: data.name || null,
                    Surveyformnums_count: surveyformnumsCount,
                    Surveyformnums_nilai: totalNilaiPerLayanan * 25
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
                let nilaiPerSurveyform = {};

                surveyforminputs.forEach(input => {
                        if (!nilaiPerSurveyform[input.surveyform_id]) {
                            nilaiPerSurveyform[input.surveyform_id] = 0;
                        }
                        nilaiPerSurveyform[input.surveyform_id] += input.nilai || 0;
                    });

                for (let surveyform_id in nilaiPerSurveyform) {
                    nilaiPerSurveyform[surveyform_id] = (nilaiPerSurveyform[surveyform_id]);
                }

                return nilaiPerSurveyform;

            };

            let formattedData = history.map(data => {
                const surveyforminputsNilai = data.Surveyforminputs ? calculateNilai(data.Surveyforminputs) : 0;

                let totalNilaiPerLayanan = Object.values(surveyforminputsNilai).reduce((sum, nilai) => sum + nilai, 0);

                return {
                    id: data.id,
                    date: data.date,
                    kritiksaran: data.kritiksaran,
                    nilai: totalNilaiPerLayanan,
                    name: data.name,
                    pekerjaan: data.pekerjaan,
                    email: data.email,
                    telepon: data.telepon,
                    alamat: data.alamat
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
                let nilaiPerSurveyform = {};

                surveyforminputs.forEach(input => {
                        if (!nilaiPerSurveyform[input.surveyform_id]) {
                            nilaiPerSurveyform[input.surveyform_id] = 0;
                        }
                        nilaiPerSurveyform[input.surveyform_id] += input.nilai || 0;
                    });

                for (let surveyform_id in nilaiPerSurveyform) {
                    nilaiPerSurveyform[surveyform_id] = (nilaiPerSurveyform[surveyform_id]);
                }

                return nilaiPerSurveyform;

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

                let totalNilaiPerLayanan = Object.values(surveyforminputsNilai).reduce((sum, nilai) => sum + nilai, 0);

                totalNilaiAll += totalNilaiPerLayanan;
                totalEntries++;

                return {
                    id: data.id,
                    date: formatTanggal(data.date),
                    kritiksaran: data.kritiksaran,
                    nilai: totalNilaiPerLayanan,
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

}