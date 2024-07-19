const { response } = require('../helpers/response.formatter');

const { Bookingantrian, Instansi, Layanan, sequelize } = require('../models');

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const Validator = require("fastest-validator");
const v = new Validator();
const { generatePagination } = require('../pagination/pagination');
const moment = require('moment-timezone');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require('uuid');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    useAccelerateEndpoint: true
});

const { Op } = require('sequelize');

module.exports = {

    // membuat bookingantrian OFFLINE
    createbookingantrian: async (req, res) => {
        try {
            const schema = {
                instansi_id: { type: "number" },
                layanan_id: { type: "number" },
                tanggal: { type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/, optional: true },
                waktu: { type: "string", optional: true },
            };

            console.log(data)

            const userinfo_id = data.role === "User" ? data.userId : null;

            const instansi = await Instansi.findByPk(req.body.instansi_id);
            if (!instansi) {
                return res.status(404).json({ status: 404, message: 'Instansi not found' });
            }

            const bookingantrianCreateObj = {
                instansi_id: Number(req.body.instansi_id),
                layanan_id: Number(req.body.layanan_id),
                userinfo_id: userinfo_id ?? null,
                tanggal: req.body.tanggal ?? null,
                waktu: req.body.waktu ?? null,
                status: 0
            };

            const validate = v.validate(bookingantrianCreateObj, schema);
            if (validate.length > 0) {
                return res.status(400).json({ status: 400, message: 'Validation failed', errors: validate });
            }

            if (userinfo_id) {
                const qrCodeData = {
                    instansi_id: req.body.instansi_id,
                    layanan_id: req.body.layanan_id,
                    userinfo_id: userinfo_id,
                    unique_id: uuidv4()
                };

                const qrCodeString = Buffer.from(JSON.stringify(qrCodeData)).toString('base64');
                const qrCodeBuffer = await QRCode.toBuffer(qrCodeString);

                const now = new Date();
                const datetime = now.toISOString().replace(/[-:.]/g, '');

                const namekey = `${qrCodeString}_${datetime}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `${process.env.PATH_AWS}/qrcode/${namekey}`,
                    Body: qrCodeBuffer,
                    ACL: 'public-read',
                    ContentType: 'image/png'
                };

                const command = new PutObjectCommand(uploadParams);

                await s3Client.send(command);

                imageKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;

                bookingantrianCreateObj.qrcode = imageKey;
                bookingantrianCreateObj.qrkey = qrCodeString;
            }

            const newBookingantrian = await Bookingantrian.create(bookingantrianCreateObj);

            res.status(201).json({ status: 201, message: 'Bookingantrian created successfully', data: newBookingantrian });
        } catch (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: 'Internal server error', error: err });
        }
    },

    getbookingantrian: async (req, res) => {
        try {
            const { slugdinas } = req.params;

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            let bookingantrianHariIni;
            let totalCount;

            // Validasi apakah instansi (dinas) ada
            const instansi = await Instansi.findOne({
                where: {
                    slug: slugdinas
                }
            });
            if (!instansi) {
                return res.status(404).json({ status: 404, message: 'Instansi not found' });
            }

            // Mendapatkan rentang tanggal untuk hari ini
            const startOfToday = moment().startOf('day').toDate();
            const endOfToday = moment().endOf('day').toDate();

            [bookingantrianHariIni, totalCount] = await Promise.all([
                Bookingantrian.findAll({
                    where: {
                        createdAt: {
                            [Op.between]: [startOfToday, endOfToday]
                        }
                    },
                    order: [['id', 'ASC']],
                    include: [
                        {
                            model: Instansi,
                            attributes: ['name', 'code'],
                            where: {
                                slug: slugdinas,
                            },
                        },
                        {
                            model: Layanan,
                            attributes: ['name', 'code'],
                        }
                    ],
                    limit: limit,
                    offset: offset
                }),
                Bookingantrian.count(
                    {
                        where: {
                            createdAt: {
                                [Op.between]: [startOfToday, endOfToday]
                            }
                        },
                        include: [{
                            model: Instansi,
                            where: {
                                slug: slugdinas,
                            },
                        }]
                    }
                )
            ]);

            const pagination = generatePagination(totalCount, page, limit, `/api/user/bookingantrian/get/${req.params.slugdinas}`);

            res.status(200).json({
                status: 200,
                message: 'success get',
                data: bookingantrianHariIni,
                pagination: pagination
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: 'Internal server error', error: err });
        }
    },

    getbookingantrianforuser: async (req, res) => {
        try {
            const whereCondition = { userinfo_id: data.userId };

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            let bookingantrianForUser;
            let totalCount;

            [bookingantrianForUser, totalCount] = await Promise.all([
                Bookingantrian.findAll({
                    where: whereCondition,
                    include: [
                        {
                            model: Instansi,
                            attributes: ['name', 'code'],
                        },
                        {
                            model: Layanan,
                            attributes: ['name', 'code'],
                        }
                    ],
                    limit: limit,
                    offset: offset,
                    order: [['id', 'ASC']]
                }),
                Bookingantrian.count(
                    {
                        where: whereCondition,
                        include: [{
                            model: Instansi,
                        }]
                    }
                )
            ]);

            const pagination = generatePagination(totalCount, page, limit, `/api/user/bookingantrian/getforuser`);

            res.status(200).json({
                status: 200,
                message: 'success get',
                data: bookingantrianForUser,
                pagination: pagination
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: 'Internal server error', error: err });
        }
    },

    getbookingantrianbyid: async (req, res) => {
        try {

            let BookingantrianGet = await Bookingantrian.findOne({
                where: {
                    id: req.params.idbookingantrian
                },
                include: [
                    {
                        model: Instansi,
                        attributes: ['name', 'code'],
                    },
                    {
                        model: Layanan,
                        attributes: ['name', 'syarat', 'code'],
                    }
                ],
            });

            if (!BookingantrianGet) {
                res.status(404).json(response(404, 'data not found'));
                return;
            }

            res.status(200).json(response(200, 'success get data', BookingantrianGet));
        } catch (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: 'Internal server error', error: err });
        }
    },

    getPDFbookingantrianbyid: async (req, res) => {
        try {

            let BookingantrianGet = await Bookingantrian.findOne({
                where: {
                    id: req.params.idbookingantrian
                },
                include: [
                    {
                        model: Instansi,
                        attributes: ['name', 'code', 'image'],
                    },
                    {
                        model: Layanan,
                        attributes: ['name', 'syarat', 'code'],
                    }
                ],
            });

            if (!BookingantrianGet) {
                res.status(404).json(response(404, 'data not found'));
                return;
            }

            // Read HTML template
            const templatePath = path.resolve(__dirname, '../views/tiket.html');
            let htmlContent = fs.readFileSync(templatePath, 'utf8');

            const originalDate = new Date(BookingantrianGet?.tanggal || new Date());
            moment.locale('id');
            const formattedDate = moment(originalDate).format('DD MMMM YYYY');
            const formattedTime = moment(BookingantrianGet?.waktu, 'HH:mm:ss').format('HH.mm');

            const barcode = BookingantrianGet?.qrcode || '';
            const instansiImage = path.join(`${process.env.BASE_URL}/static/images/DesignLogoMpp.svg`);
            htmlContent = htmlContent.replace('{{instansiImage}}', instansiImage);
            console.log("aaaaaaaa", instansiImage)
            htmlContent = htmlContent.replace('{{barcode}}', barcode);
            htmlContent = htmlContent.replace('{{instansiName}}', BookingantrianGet?.Instansi?.name ?? '');
            htmlContent = htmlContent.replace('{{layananName}}', BookingantrianGet?.Layanan?.name ?? '');
            htmlContent = htmlContent.replace('{{layananCode}}', BookingantrianGet?.Layanan?.code ?? '');
            htmlContent = htmlContent.replace('{{tanggal}}', formattedDate);
            htmlContent = htmlContent.replace('{{waktu}}', formattedTime);

            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                timeout: 60000 // Increase timeout to 60 seconds
            });
            const page = await browser.newPage();

            // Set HTML content and wait until all resources are loaded
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

            // Generate PDF with 1 cm margins
            const pdfBuffer = await page.pdf({
                width: '2.91in',  // Custom width (e.g., 7.4 cm)
                height: '4.13in', // Custom height (e.g., 10.5 cm)
                margin: {
                    top: '0.39in',    // 1 cm
                    right: '0.12in',  // 1 cm
                    bottom: '0.39in', // 1 cm
                    left: '0.12in'    // 1 cm
                }
            });

            await browser.close();

            // Generate filename with current date and time
            const currentDate = new Date().toISOString().replace(/:/g, '-');
            const filename = `tiket-${currentDate}.pdf`;

            // Set response headers and send the PDF buffer
            res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
            res.setHeader('Content-type', 'application/pdf');
            res.send(pdfBuffer);

        } catch (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: 'Internal server error', error: err });
        }
    },

    deletebookingantrian: async (req, res) => {
        let transaction;
        try {
            const { startDateTime, endDateTime, deleteAll } = req.body;

            transaction = await sequelize.transaction();

            if (deleteAll) {
                const deleted = await Bookingantrian.destroy({
                    where: {
                        instansi_id: data.instansi_id
                    },
                    transaction
                });

                await transaction.commit();

                return res.status(200).json({ status: 200, message: `${deleted} bookingantrian(s) deleted successfully` });
            }

            // Validasi input untuk rentang tanggal
            if (!startDateTime) {
                return res.status(400).json({ status: 400, message: 'Start date is required' });
            }

            // Konversi input tanggal ke waktu UTC dengan awal dan akhir hari
            const startUTC = moment.tz(startDateTime, "UTC").startOf('day').toDate();
            const endUTC = endDateTime ? moment.tz(endDateTime, "UTC").endOf('day').toDate() : moment(startUTC).endOf('day').toDate();

            // Menentukan rentang tanggal dan waktu dalam UTC
            const dateTimeRange = {
                [Op.between]: [startUTC, endUTC]
            };

            const bookingantrianAudio = await Bookingantrian.findAll({
                where: {
                    createdAt: dateTimeRange,
                    instansi_id: data.instansi_id
                },
                attributes: ['audio', 'qrcode'],
            });

            // Hapus data bookingantrian dalam rentang tanggal dan waktu tersebut
            const deleted = await Bookingantrian.destroy({
                where: {
                    createdAt: dateTimeRange,
                    instansi_id: data.instansi_id
                },
                transaction
            });

            await transaction.commit();

            // Mengembalikan response
            res.status(200).json({ status: 200, message: `${deleted} bookingantrian(s) deleted successfully` });
        } catch (err) {
            if (transaction) await transaction.rollback();

            if (err.name === 'SequelizeForeignKeyConstraintError') {
                res.status(400).json(response(400, 'Data tidak bisa dihapus karena masih digunakan pada tabel lain'));
            } else {
                res.status(500).json(response(500, 'Internal server error', err));
                console.log(err);
            }
        }
    },

}