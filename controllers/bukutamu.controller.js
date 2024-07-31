const { response } = require('../helpers/response.formatter');

const { Bukutamu, Instansi } = require('../models');

const path = require('path');
const Validator = require("fastest-validator");
const v = new Validator();
const puppeteer = require('puppeteer');
const fs = require('fs');
const { generatePagination } = require('../pagination/pagination');
const { Op } = require('sequelize');

module.exports = {

    // membuat bukutamu OFFLINE
    createbukutamu: async (req, res) => {
        try {
            const schema = {
                name: { type: "string" },
                instansi_id: { type: "number" },
                pekerjaan: { type: "string", optional: true },
                alamat: { type: "string", optional: true },
                tujuan: { type: "string", optional: true },
                tanggal: { type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/, optional: true },
                waktu: { type: "string", optional: true },
            };

            const bukutamuCreateObj = {
                name: req.body.name,
                instansi_id: Number(req.body.instansi_id),
                pekerjaan: req.body.pekerjaan,
                alamat: req.body.alamat,
                tujuan: req.body.tujuan,
                tanggal: req.body.tanggal,
                waktu: req.body.waktu
            };

            const validate = v.validate(bukutamuCreateObj, schema);
            if (validate.length > 0) {
                return res.status(400).json({ status: 400, message: 'Validation failed', errors: validate });
            }

            const newBukutamu = await Bukutamu.create(bukutamuCreateObj);

            res.status(201).json({ status: 201, message: 'Bukutamu created successfully', data: newBukutamu });
        } catch (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: 'Internal server error', error: err });
        }
    },

    getbukutamu: async (req, res) => {
        try {
            const { instansi_id, start_date, end_date } = req.query;
            const search = req.query.search ?? null;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            let BukutamuGets;
            let totalCount;

            const WhereClause = {};
            if (instansi_id) {
                WhereClause.instansi_id = instansi_id;
            }

            if (data.role === 'Admin Instansi' || data.role === 'Admin Verifikasi' || data.role === 'Admin Layanan') {
                WhereClause.instansi_id = data.instansi_id;
            }

            if (start_date && end_date) {
                WhereClause.createdAt = { [Op.between]: [new Date(start_date), new Date(end_date)] };
            } else if (start_date) {
                WhereClause.createdAt = { [Op.gte]: new Date(start_date) };
            } else if (end_date) {
                WhereClause.createdAt = { [Op.lte]: new Date(end_date) };
            }

            if (search) {
                WhereClause[Op.or] = [
                    { name: { [Op.iLike]: `%${search}%` } },
                    { pekerjaan: { [Op.iLike]: `%${search}%` } },
                ];
            }

            [BukutamuGets, totalCount] = await Promise.all([
                Bukutamu.findAll({
                    where: WhereClause,
                    limit: limit,
                    offset: offset
                }),
                Bukutamu.count({
                    where: WhereClause,
                })
            ]);

            const pagination = generatePagination(totalCount, page, limit, '/api/user/bukutamu/get');

            res.status(200).json({
                status: 200,
                message: 'success get Bukutamu',
                data: BukutamuGets,
                pagination: pagination
            });

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    pdfbukutamu: async (req, res) => {
        try {
            let { instansi_id, start_date, end_date } = req.query;
            const search = req.query.search ?? null;
            let BukutamuGets;

            const WhereClause = {};
            if (instansi_id) {
                WhereClause.instansi_id = instansi_id;
            }

            if (search) {
                WhereClause[Op.or] = [
                    { name: { [Op.iLike]: `%${search}%` } },
                    { pekerjaan: { [Op.iLike]: `%${search}%` } },
                ];
            }

            if (data.role === 'Admin Instansi' || data.role === 'Admin Verifikasi' || data.role === 'Admin Layanan') {
                instansi_id = data.instansi_id;
                WhereClause.instansi_id = data.instansi_id;
            }

            if (start_date && end_date) {
                WhereClause.createdAt = { [Op.between]: [new Date(start_date), new Date(end_date)] };
            } else if (start_date) {
                WhereClause.createdAt = { [Op.gte]: new Date(start_date) };
            } else if (end_date) {
                WhereClause.createdAt = { [Op.lte]: new Date(end_date) };
            }

            BukutamuGets = await Promise.all([
                Bukutamu.findAll({
                    where: WhereClause,
                })
            ]);

            // Generate HTML content for PDF
            const templatePath = path.resolve(__dirname, '../views/bukutamu.html');
            let htmlContent = fs.readFileSync(templatePath, 'utf8');
            let instansiGet;

            if (instansi_id) {
                instansiGet = await Instansi.findOne({
                    where: {
                        id: instansi_id
                    },
                });
            }

            const instansiInfo = instansiGet?.name ? `<p>Instansi : ${instansiGet?.name}</p>` : '';
            let tanggalInfo = '';
            if (start_date || end_date) {
                const startDateFormatted = start_date ? new Date(start_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
                const endDateFormatted = end_date ? new Date(end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
                tanggalInfo = `<p>Periode Tanggal : ${startDateFormatted} s.d. ${endDateFormatted ? endDateFormatted : 'Hari ini'} </p>`;
            }

            const reportTableRows = BukutamuGets[0]?.map(bukutamu => {
                const createdAtDate = new Date(bukutamu.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
                const createdAtTime = new Date(bukutamu.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

                return `
                    <tr>
                        <td class="center">${createdAtDate}</td>
                        <td class="center">${createdAtTime} WIB</td>
                        <td>${bukutamu.name}</td>
                        <td>${bukutamu.pekerjaan}</td>
                         <td>${bukutamu.tujuan}</td>
                    </tr>
                `;
            }).join('');

            htmlContent = htmlContent.replace('{{instansiInfo}}', instansiInfo);
            htmlContent = htmlContent.replace('{{tanggalInfo}}', tanggalInfo);
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

    getBukutamuByid: async (req, res) => {
        try {
            //mendapatkan data Bukutamu berdasarkan id
            let BukutamuGet = await Bukutamu.findOne({
                where: {
                    id: req.params.id
                },
            });

            //cek jika Bukutamu tidak ada
            if (!BukutamuGet) {
                res.status(404).json(response(404, 'Bukutamu not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get Bukutamu by id', BukutamuGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

}