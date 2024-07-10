const { response } = require('../helpers/response.formatter');

const { Antrian, Instansi, Layanan, sequelize } = require('../models');

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const Validator = require("fastest-validator");
const v = new Validator();
const { generatePagination } = require('../pagination/pagination');
const moment = require('moment-timezone');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    useAccelerateEndpoint: true
});

const { Sequelize, Op } = require('sequelize');

// function numberToAlphabeticCode(number) {
//     let code = '';
//     while (number > 0) {
//         let remainder = (number - 1) % 26;
//         code = String.fromCharCode(65 + remainder) + code;
//         number = Math.floor((number - 1) / 26);
//     }
//     return code;
// }

module.exports = {

    // membuat antrian OFFLINE
    createantrian: async (req, res) => {
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

            const antrianCreateObj = {
                // code: codeBooking,
                instansi_id: Number(req.body.instansi_id),
                layanan_id: Number(req.body.layanan_id),
                userinfo_id: userinfo_id ?? null,
                tanggal: req.body.tanggal ?? null,
                waktu: req.body.waktu ?? null,
                status: 0
            };

            const validate = v.validate(antrianCreateObj, schema);
            if (validate.length > 0) {
                return res.status(400).json({ status: 400, message: 'Validation failed', errors: validate });
            }

            if (userinfo_id) {
                const qrCodeData = {
                    instansi_id: req.body.instansi_id,
                    layanan_id: req.body.layanan_id,
                    userinfo_id: userinfo_id
                };

                const qrCodeString = Buffer.from(JSON.stringify(qrCodeData)).toString('base64');
                const qrCodeBuffer = await QRCode.toBuffer(qrCodeString);

                const now = new Date();
                const datetime = now.toISOString().replace(/[-:.]/g, '');

                // const codeBookingfix = `${codeBooking}_${datetime}`;

                const namekey = `${qrCodeString}_${datetime}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `dir_mpp/qrcode/${namekey}`,
                    Body: qrCodeBuffer,
                    ACL: 'public-read',
                    ContentType: 'image/png'
                };

                const command = new PutObjectCommand(uploadParams);

                await s3Client.send(command);

                imageKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;

                antrianCreateObj.qrcode = imageKey;
            }

            const newAntrian = await Antrian.create(antrianCreateObj);

            res.status(201).json({ status: 201, message: 'Antrian created successfully', data: newAntrian });
        } catch (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: 'Internal server error', error: err });
        }
    },

    getantrian: async (req, res) => {
        try {
            const { slugdinas } = req.params;

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            let antrianHariIni;
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

            [antrianHariIni, totalCount] = await Promise.all([
                Antrian.findAll({
                    where: {
                        createdAt: {
                            [Op.between]: [startOfToday, endOfToday]
                        }
                    },
                    include: [{
                        model: Instansi,
                        attributes: ['name'],
                        where: {
                            slug: slugdinas,
                        },
                    }],
                    limit: limit,
                    offset: offset
                }),
                Antrian.count(
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

            const pagination = generatePagination(totalCount, page, limit, `/api/user/antrian/get/${req.params.slugdinas}`);

            res.status(200).json({
                status: 200,
                message: 'success get',
                data: antrianHariIni,
                pagination: pagination
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: 'Internal server error', error: err });
        }
    },

    getantrianforuser: async (req, res) => {
        try {
            const whereCondition = { userinfo_id: data.userId };

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            let antrianForUser;
            let totalCount;

            [antrianForUser, totalCount] = await Promise.all([
                Antrian.findAll({
                    where: whereCondition,
                    include: [{
                        model: Instansi,
                        attributes: ['name'],
                    }],
                    limit: limit,
                    offset: offset
                }),
                Antrian.count(
                    {
                        where: whereCondition,
                        include: [{
                            model: Instansi,
                        }]
                    }
                )
            ]);

            const pagination = generatePagination(totalCount, page, limit, `/api/user/antrian/get/foruser`);

            res.status(200).json({
                status: 200,
                message: 'success get',
                data: antrianForUser,
                pagination: pagination
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: 'Internal server error', error: err });
        }
    },

    getantrianbyid: async (req, res) => {
        try {

            let AntrianGet = await Antrian.findOne({
                where: {
                    id: req.params.idantrian
                },
                include: [
                    {
                        model: Instansi,
                        attributes: ['name'],
                    },
                    {
                        model: Layanan,
                        attributes: ['name', 'syarat'],
                    }
                ],
            });

            if (!AntrianGet) {
                res.status(404).json(response(404, 'data not found'));
                return;
            }

            res.status(200).json(response(200, 'success get data', AntrianGet));
        } catch (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: 'Internal server error', error: err });
        }
    },

    getPDFantrianbyid: async (req, res) => {
        try {

            let AntrianGet = await Antrian.findOne({
                where: {
                    id: req.params.idantrian
                },
                include: [
                    {
                        model: Instansi,
                        attributes: ['name'],
                    },
                    {
                        model: Layanan,
                        attributes: ['name', 'syarat'],
                    }
                ],
            });

            // Read HTML template
            const templatePath = path.resolve(__dirname, '../views/tiket.html');
            let htmlContent = fs.readFileSync(templatePath, 'utf8');

            const originalDate = new Date(AntrianGet?.tanggal || new Date());
            const formattedDate = `${(originalDate.getMonth() + 1).toString().padStart(2, '0')}/${originalDate.getDate().toString().padStart(2, '0')}/${originalDate.getFullYear()}`;
            const formattedTime = originalDate.toTimeString().split(' ')[0].slice(0, 5); // Format HH:MM

            const barcode = AntrianGet?.qrcode || '';
            htmlContent = htmlContent.replace('{{barcode}}', barcode);
            htmlContent = htmlContent.replace('{{instansiName}}', AntrianGet?.Instansi?.name ?? '');
            htmlContent = htmlContent.replace('{{layananName}}', AntrianGet?.Layanan?.name ?? '');
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
                    right: '0.39in',  // 1 cm
                    bottom: '0.39in', // 1 cm
                    left: '0.39in'    // 1 cm
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

    deleteantrian: async (req, res) => {
        let transaction;
        try {
            const { startDateTime, endDateTime, deleteAll } = req.body;

            transaction = await sequelize.transaction();

            if (deleteAll) {
                const antrianAudio = await Antrian.findAll({
                    where: {
                        instansi_id: data.instansi_id
                    },
                    attributes: ['audio', 'qrcode'],
                    transaction
                });

                const deleted = await Antrian.destroy({
                    where: {
                        instansi_id: data.instansi_id
                    },
                    transaction
                });

                await transaction.commit();

                return res.status(200).json({ status: 200, message: `${deleted} antrian(s) deleted successfully` });
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

            const antrianAudio = await Antrian.findAll({
                where: {
                    createdAt: dateTimeRange,
                    instansi_id: data.instansi_id
                },
                attributes: ['audio', 'qrcode'],
            });

            // Hapus data antrian dalam rentang tanggal dan waktu tersebut
            const deleted = await Antrian.destroy({
                where: {
                    createdAt: dateTimeRange,
                    instansi_id: data.instansi_id
                },
                transaction
            });

            await transaction.commit();

            // Mengembalikan response
            res.status(200).json({ status: 200, message: `${deleted} antrian(s) deleted successfully` });
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