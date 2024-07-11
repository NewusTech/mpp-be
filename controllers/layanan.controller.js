const { response } = require('../helpers/response.formatter');

const { Layanan, Layananformnum, Instansi } = require('../models');
require('dotenv').config()

const slugify = require('slugify');
const Validator = require("fastest-validator");
const v = new Validator();
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { generatePagination } = require('../pagination/pagination');
const { Op } = require('sequelize');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const logger = require('../errorHandler/logger');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    useAccelerateEndpoint: true
});

module.exports = {

    //membuat layanan
    createlayanan: async (req, res) => {
        try {

            //membuat schema untuk validasi
            const schema = {
                name: { type: "string", min: 3 },
                desc: { type: "string", min: 3, optional: true },
                dasarhukum: { type: "string", min: 3, optional: true },
                syarat: { type: "string", min: 3, optional: true },
                image: { type: "string", optional: true },
                active_offline: { type: "number", optional: true },
                active_online: { type: "number", optional: true },
                status: { type: "number", optional: true },
                instansi_id: { type: "number", optional: true }
            }

            if (req.file) {
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${req.file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `dir_mpp/layanan/${uniqueFileName}`,
                    Body: req.file.buffer,
                    ACL: 'public-read',
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);

                await s3Client.send(command);

                imageKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            //buat object layanan
            let layananCreateObj = {
                name: req.body.name,
                slug: slugify(req.body.name, { lower: true }),
                desc: req.body.desc,
                dasarhukum: req.body.dasarhukum,
                syarat: req.body.syarat,
                image: req.file ? imageKey : null,
                active_offline: req.body.active_offline ? Number(req.body.active_offline) : false,
                active_online: req.body.active_online ? Number(req.body.active_online) : false,
                status: req.body.status ? Number(req.body.status) : false,
                instansi_id: req.body.instansi_id !== undefined ? Number(req.body.instansi_id) : null,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(layananCreateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //mendapatkan data data untuk pengecekan
            let dataGets = await Layanan.findOne({
                where: {
                    slug: layananCreateObj.slug
                }
            }
            );

            //cek apakah slug sudah terdaftar
            if (dataGets) {
                res.status(409).json(response(409, 'slug already registered'));
                return;
            }

            //buat layanan
            let layananCreate = await Layanan.create(layananCreateObj);

            //response menggunakan helper response.formatter
            res.status(201).json(response(201, 'success create layanan', layananCreate));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan semua data layanan
    getlayanan: async (req, res) => {
        try {
            const search = req.query.search ?? null;
            const showDeleted = req.query.showDeleted === 'true' ?? false;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            let layananGets;
            let totalCount;

            const whereCondition = {};
            if (search) {
                whereCondition[Op.or] = [{ name: { [Op.iLike]: `%${search}%` } }];
            }
            if (showDeleted) {
                whereCondition.deletedAt = { [Op.not]: null };
            } else {
                whereCondition.deletedAt = null;
            }

            if (data?.role === "Admin Instansi" || data?.role === "Super Admin" || data?.role === "Bupati" || data?.role === "Staff Instansi") {
            } else {
                whereCondition.status = true;
            }

            [layananGets, totalCount] = await Promise.all([
                Layanan.findAll({
                    where: whereCondition,
                    include: [{ model: Instansi, attributes: ['id', 'name'] }],
                    limit: limit,
                    offset: offset,
                    order: [
                        ['status', 'DESC'],
                        ['id', 'ASC']
                    ]
                }),
                Layanan.count({
                    where: whereCondition
                })
            ]);

            const modifiedLayananGets = layananGets.map(layanan => {
                const { Instansi, ...otherData } = layanan.dataValues;
                return {
                    ...otherData,
                    instansi_name: Instansi.name
                };
            });

            const pagination = generatePagination(totalCount, page, limit, '/api/user/layanan/get');

            res.status(200).json({
                status: 200,
                message: 'success get layanan',
                data: modifiedLayananGets,
                pagination: pagination
            });

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan semua data layanan by dinas
    getlayananbydinas: async (req, res) => {
        try {
            const instansi_id = req.params.instansi_id;
            const showDeleted = req.query.showDeleted === 'true' ?? false;
            const search = req.query.search ?? null;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            let layananGets;
            let totalCount;

            const whereCondition = {
                instansi_id: instansi_id
            };

            if (data?.role === "Admin Instansi" || data?.role === "Super Admin" || data?.role === "Bupati" || data?.role === "Staff Instansi") {
            } else {
                whereCondition.status = true;
            }

            if (search) {
                whereCondition[Op.and] = [
                    whereCondition,
                    { name: { [Op.iLike]: `%${search}%` } }
                ];
            }

            if (showDeleted) {
                whereCondition.deletedAt = { [Op.not]: null };
            } else {
                whereCondition.deletedAt = null;
            }

            [layananGets, totalCount] = await Promise.all([
                Layanan.findAll({
                    where: whereCondition,
                    include: [{ model: Instansi, attributes: ['id', 'name'] }],
                    limit: limit,
                    offset: offset,
                    order: [
                        ['status', 'DESC'],
                        ['id', 'ASC']
                    ]
                }),
                Layanan.count({
                    where: whereCondition
                })
            ]);

            const modifiedLayananGets = layananGets.map(layanan => {
                const { Instansi, ...otherData } = layanan.dataValues;
                return {
                    ...otherData,
                    instansi_name: Instansi.name
                };
            });

            const pagination = generatePagination(totalCount, page, limit, `/api/user/layanan/dinas/get/${instansi_id}`);

            res.status(200).json({
                status: 200,
                message: 'success get layanan by dinas',
                data: modifiedLayananGets,
                pagination: pagination
            });

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan data layanan berdasarkan id
    getlayananById: async (req, res) => {
        try {
            const showDeleted  = req.query.showDeleted  ?? null;
            const whereCondition = { id: req.params.id };

            if (showDeleted  !== null) {
                whereCondition.deletedAt = { [Op.not]: null };
            } else {
                whereCondition.deletedAt = null;
            }

            if (data?.role === "Admin Instansi" || data?.role === "Super Admin" || data?.role === "Bupati" || data?.role === "Staff Instansi") {
            } else {
                whereCondition.status = true;
            }

            let layananGet = await Layanan.findOne({
                where: whereCondition,
                include: [{ model: Instansi, attributes: ['id', 'name'] }]
            });

            //cek jika layanan tidak ada
            if (!layananGet) {
                res.status(404).json(response(404, 'layanan not found'));
                return;
            }

            const { Instansi: instansiObj, ...otherData } = layananGet.dataValues;
            const modifiedLayananGet = {
                ...otherData,
                instansi_name: instansiObj.name
            };

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get layanan by id', modifiedLayananGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate layanan berdasarkan id
    updatelayanan: async (req, res) => {
        try {
            //mendapatkan data layanan untuk pengecekan
            let layananGet = await Layanan.findOne({
                where: {
                    id: req.params.id,
                    deletedAt: null
                }
            })

            //cek apakah data layanan ada
            if (!layananGet) {
                res.status(404).json(response(404, 'layanan not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                name: { type: "string", min: 3, optional: true },
                desc: { type: "string", min: 3, optional: true },
                dasarhukum: { type: "string", min: 3, optional: true },
                syarat: { type: "string", min: 3, optional: true },
                image: { type: "string", optional: true },
                active_offline: { type: "number", optional: true },
                active_online: { type: "number", optional: true },
                status: { type: "number", optional: true },
            }

            if (req.file) {
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${req.file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `dir_mpp/layanan/${uniqueFileName}`,
                    Body: req.file.buffer,
                    ACL: 'public-read',
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);

                await s3Client.send(command);

                imageKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            //buat object layanan
            let layananUpdateObj = {
                name: req.body.name,
                slug: req.body.name ? slugify(req.body.name, { lower: true }) : undefined,
                desc: req.body.desc,
                dasarhukum: req.body.dasarhukum,
                syarat: req.body.syarat,
                image: req.file ? imageKey : layananGet.image,
                active_offline: req.body.active_offline ? Number(req.body.active_offline) : undefined,
                active_online: req.body.active_online ? Number(req.body.active_online) : undefined,
                status: req.body.status ? Number(req.body.status) : undefined,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(layananUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update layanan
            await Layanan.update(layananUpdateObj, {
                where: {
                    id: req.params.id,
                }
            })

            //mendapatkan data layanan setelah update
            let layananAfterUpdate = await Layanan.findOne({
                where: {
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update layanan', layananAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //menghapus layanan berdasarkan id
    deletelayanan: async (req, res) => {
        try {

            //mendapatkan data layanan untuk pengecekan
            let layananGet = await Layanan.findOne({
                where: {
                    id: req.params.id,
                    deletedAt: null
                }
            })

            //cek apakah data layanan ada
            if (!layananGet) {
                res.status(404).json(response(404, 'layanan not found'));
                return;
            }

            await Layanan.update({ deletedAt: new Date() }, {
                where: {
                    id: req.params.id
                }
            });

            res.status(200).json(response(200, 'success delete layanan'));

        } catch (err) {
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

    reportlayanan: async (req, res) => {
        try {
            const instansi_id = Number(req.query.instansi_id);
            const start_date = req.query.start_date;
            const end_date = req.query.end_date;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            let report;
            let totalCount;

            const WhereClause = {};
            const WhereClause2 = {};

            if (instansi_id) {
                WhereClause.instansi_id = instansi_id;
            }
            if (start_date && end_date) {
                WhereClause2.createdAt = {
                    [Op.between]: [new Date(start_date), new Date(end_date)]
                };
            } else if (start_date) {
                WhereClause2.createdAt = {
                    [Op.gte]: new Date(start_date)
                };
            } else if (end_date) {
                WhereClause2.createdAt = {
                    [Op.lte]: new Date(end_date)
                };
            }

            const includeOptions = [{
                model: Layananformnum,
                attributes: ['id', 'status'],
                required: false,
            }];

            if (Object.keys(WhereClause2).length > 0) {
                includeOptions[0].where = WhereClause2;
            }

            [report, totalCount] = await Promise.all([
                Layanan.findAll({
                    include: includeOptions,
                    where: WhereClause,
                    limit: limit,
                    offset: offset,
                    attributes: ['id', 'name', 'slug', 'image'],
                }),
                Layanan.count({
                    where: WhereClause,
                })
            ]);

            let total_menunggu = 0;
            let total_selesai = 0;
            let total_gagal = 0;

            const transformedReport = report.map(layanan => {
                const statusCounts = { menunggu: 0, selesai: 0, gagal: 0 };

                layanan.Layananformnums.forEach(formnum => {
                    if (formnum.status === 0 || formnum.status === 1 || formnum.status === 2) statusCounts.menunggu++;
                    if (formnum.status === 3) statusCounts.selesai++;
                    if (formnum.status === 4) statusCounts.gagal++;
                });

                total_menunggu += statusCounts.menunggu;
                total_selesai += statusCounts.selesai;
                total_gagal += statusCounts.gagal;

                return {
                    id: layanan.id,
                    name: layanan.name,
                    slug: layanan.slug,
                    image: layanan.image,
                    ...statusCounts
                };
            });

            const pagination = generatePagination(totalCount, page, limit, `/api/user/layanan/report`);

            res.status(200).json({
                status: 200,
                message: 'success get',
                data: {
                    report: transformedReport,
                    total_menunggu: total_menunggu,
                    total_selesai: total_selesai,
                    total_gagal: total_gagal,
                },
                pagination: pagination
            });

        } catch (err) {
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

    pdfreportlayanan: async (req, res) => {
        try {
            const instansi_id = req.query.instansi_id ? Number(req.query.instansi_id) : null;
            const start_date = req.query.start_date;
            const end_date = req.query.end_date;
            let report;
            let totalCount;

            const WhereClause = {};
            const WhereClause2 = {};

            if (instansi_id) {
                WhereClause.instansi_id = instansi_id;
            }
            if (start_date && end_date) {
                WhereClause2.createdAt = {
                    [Op.between]: [new Date(start_date), new Date(end_date)]
                };
            } else if (start_date) {
                WhereClause2.createdAt = {
                    [Op.gte]: new Date(start_date)
                };
            } else if (end_date) {
                WhereClause2.createdAt = {
                    [Op.lte]: new Date(end_date)
                };
            }

            const includeOptions = [
                {
                    model: Layananformnum,
                    attributes: ['id', 'status'],
                    required: false,
                }
            ];

            if (Object.keys(WhereClause2).length > 0) {
                includeOptions[0].where = WhereClause2;
            }

            [report, totalCount] = await Promise.all([
                Layanan.findAll({
                    include: includeOptions,
                    where: WhereClause,
                    attributes: ['id', 'name', 'slug', 'image'],
                }),
                Layanan.count({
                    where: WhereClause,
                })
            ]);

            let total_menunggu = 0;
            let total_selesai = 0;
            let total_gagal = 0;

            const transformedReport = report.map(layanan => {
                const statusCounts = { menunggu: 0, selesai: 0, gagal: 0 };

                layanan.Layananformnums.forEach(formnum => {
                    if (formnum.status === 0 || formnum.status === 1 || formnum.status === 2) statusCounts.menunggu++;
                    if (formnum.status === 3) statusCounts.selesai++;
                    if (formnum.status === 4) statusCounts.gagal++;
                });

                total_menunggu += statusCounts.menunggu;
                total_selesai += statusCounts.selesai;
                total_gagal += statusCounts.gagal;

                return {
                    id: layanan.id,
                    name: layanan.name,
                    slug: layanan.slug,
                    image: layanan.image,
                    ...statusCounts
                };
            });

            // Generate HTML content for PDF
            const templatePath = path.resolve(__dirname, '../views/laporan.html');
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
            const reportTableRows = transformedReport.map(layanan => `
                <tr>
                    <td>${layanan.name}</td>
                    <td class="center">${layanan.menunggu}</td>
                    <td class="center">${layanan.selesai}</td>
                    <td class="center">${layanan.gagal}</td>
                </tr>
            `).join('');
            // <td><img src="${layanan.image}" alt="${layanan.name}" width="50"/></td>

            htmlContent = htmlContent.replace('{{instansiInfo}}', instansiInfo);
            htmlContent = htmlContent.replace('{{tanggalInfo}}', tanggalInfo);
            htmlContent = htmlContent.replace('{{reportTableRows}}', reportTableRows);
            htmlContent = htmlContent.replace('{{total_menunggu}}', total_menunggu);
            htmlContent = htmlContent.replace('{{total_selesai}}', total_selesai);
            htmlContent = htmlContent.replace('{{total_gagal}}', total_gagal);

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
            logger.error(`Error : ${err}`);
            logger.error(`Error message: ${err.message}`);
            console.log(err);
        }
    },

    updateMultipleLayanans: async (req, res) => {
        try {
            // Define schema for validation
            const schema = {
                id: { type: "number", positive: true, integer: true },
                active_online: { type: "boolean", optional: true },
                active_offline: { type: "boolean", optional: true }
            };

            // Check if the request body is an array
            if (!Array.isArray(req.body)) {
                res.status(400).json(response(400, 'Request body must be an array of objects'));
                return;
            }

            let errors = [];
            let updatedLayanans = [];

            // Validate and process each object in the input array
            for (let input of req.body) {
                // Create the layanan update object
                let layananUpdateObj = {
                    id: input.id,
                    active_online: input.active_online,
                    active_offline: input.active_offline
                };

                // Validate the object
                const validate = v.validate(layananUpdateObj, schema);
                if (validate.length > 0) {
                    errors.push({ input, errors: validate });
                    continue;
                }

                // Update layanan in the database
                await Layanan.update(
                    {
                        active_online: input.active_online,
                        active_offline: input.active_offline
                    },
                    {
                        where: { id: input.id }
                    }
                );

                // Fetch the updated layanan
                let updatedLayanan = await Layanan.findOne({ where: { id: input.id } });
                updatedLayanans.push(updatedLayanan);
            }

            // If there are validation errors, respond with them
            if (errors.length > 0) {
                res.status(400).json(response(400, 'Validation failed', errors));
                return;
            }

            // Respond with the successfully updated objects
            res.status(200).json(response(200, 'Successfully updated layanans', updatedLayanans));
        } catch (err) {
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    }

}