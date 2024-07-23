const { response } = require('../helpers/response.formatter');

const { Bookingantrian, Antrian, Instansi, Layanan, sequelize } = require('../models');

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const tts = require('google-tts-api');
const axios = require('axios');
const Validator = require("fastest-validator");
const v = new Validator();
const { generatePagination } = require('../pagination/pagination');
const moment = require('moment-timezone');
const { Sequelize, Op } = require('sequelize');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    useAccelerateEndpoint: true
});

module.exports = {

    // membuat antrian OFFLINE
    createantrian: async (req, res) => {
        try {
            const schema = {
                instansi_id: { type: "number" },
                layanan_id: { type: "number" }
            };

            const today = new Date().toISOString().split('T')[0];

            const existingAntrian = await Antrian.findAll({
                where: {
                    instansi_id: req.body.instansi_id,
                    layanan_id: req.body.layanan_id,
                    createdAt: {
                        [Sequelize.Op.gte]: new Date(today)
                    }
                }
            });

            const instansi = await Instansi.findOne({
                where: {
                    id: req.body.instansi_id
                },
                attributes: ['id', 'code']
            });

            const layanan = await Layanan.findOne({
                where: {
                    id: req.body.layanan_id
                },
                attributes: ['id', 'code']
            });

            const newNumber = existingAntrian.length + 1;
            const codeBooking = `${instansi.code}${layanan.code}-${String(newNumber).padStart(3, '0')}`;

            const antrianCreateObj = {
                code: codeBooking,
                instansi_id: Number(req.body.instansi_id),
                layanan_id: Number(req.body.layanan_id),
                status: 0,
                createdAt: Date.now()
            };

            const validate = v.validate(antrianCreateObj, schema);
            if (validate.length > 0) {
                return res.status(400).json({ status: 400, message: 'Validation failed', errors: validate });
            }

            const newAntrian = await Antrian.create(antrianCreateObj);

            res.status(201).json({ status: 201, message: 'Antrian created successfully', data: newAntrian });
        } catch (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: 'Internal server error', error: err });
        }
    },

    createAntrianFromQRCode: async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const { qr_code } = req.body;

            if (!qr_code) {
                await transaction.rollback();
                return res.status(400).json({ status: 400, message: 'QR code is required' });
            }

            const bookingantrian = await Bookingantrian.findOne({
                where: {
                    qrkey: qr_code
                },
                attributes: ['id', 'status']
            });

            console.log("apapa", bookingantrian.status)

            if (bookingantrian.status === true) {
                await transaction.rollback();
                return res.status(200).json({ status: 200, message: 'Sudah scan' });
            }

            // Mengurai data dari QR code
            const qrCodeData = JSON.parse(Buffer.from(qr_code, 'base64').toString('utf8'));

            const { instansi_id, layanan_id, userinfo_id } = qrCodeData;

            // Mendapatkan tanggal hari ini
            const today = new Date().toISOString().split('T')[0];

            const existingAntrian = await Antrian.findAll({
                where: {
                    instansi_id,
                    layanan_id,
                    createdAt: {
                        [Sequelize.Op.gte]: new Date(today)
                    }
                }
            });

            const instansi = await Instansi.findOne({
                where: {
                    id: instansi_id
                },
                attributes: ['id', 'code']
            });

            const layanan = await Layanan.findOne({
                where: {
                    id: layanan_id
                },
                attributes: ['id', 'code']
            });

            const newNumber = existingAntrian.length + 1;
            const codeBooking = `${instansi.code}${layanan.code}-${String(newNumber).padStart(3, '0')}`;

            const antrianCreateObj = {
                code: codeBooking,
                instansi_id,
                layanan_id,
                userinfo_id,
                status: 0
            };

            const newAntrian = await Antrian.create(antrianCreateObj, { transaction });

            await Bookingantrian.update({
                status: 1
            }, {
                where: {
                    qrkey: qr_code,
                },
                transaction
            });

            await transaction.commit();
            res.status(201).json({ status: 201, message: 'Antrian created successfully from QR code', data: newAntrian });
        } catch (err) {
            console.error(err);
            await transaction.rollback();
            res.status(500).json({ status: 500, message: 'Internal server error', error: err });
        }
    },

    getantrianbyinstansi: async (req, res) => {
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
                    order: [['id', 'ASC']],
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
                        include: [
                            {
                                model: Instansi,
                                where: {
                                    slug: slugdinas,
                                },
                            },
                            {
                                model: Layanan,
                            }
                        ]
                    }
                )
            ]);

            const pagination = generatePagination(totalCount, page, limit, `/api/user/antrian/get/instansi/${req.params.slugdinas}`);

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

    getantrianbylayanan: async (req, res) => {
        try {
            const { sluglayanan } = req.params;

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            let antrianHariIni;
            let totalCount;

            // Validasi apakah layanan (dinas) ada
            const layanan = await Layanan.findOne({
                where: {
                    slug: sluglayanan
                }
            });
            if (!layanan) {
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
                    include: [
                        {
                            model: Layanan,
                            attributes: ['name', 'code'],
                            where: {
                                slug: sluglayanan,
                            },
                        },
                        {
                            model: Instansi,
                            attributes: ['name', 'code'],
                        }
                    ],
                    order: [['id', 'ASC']],
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
                            model: Layanan,
                            where: {
                                slug: sluglayanan,
                            },
                        }]
                    }
                )
            ]);

            const pagination = generatePagination(totalCount, page, limit, `/api/user/antrian/get/instansi/${req.params.slugdinas}`);

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

    checkantrian: async (req, res) => {
        try {

            const { idlayanan } = req.params;

            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            const endOfDay = new Date(today.setHours(23, 59, 59, 999));

            const [LayananData, AntrianCount, AntrianNumber, AntrianClear] = await Promise.all([
                Layanan.findOne({
                    where: {
                        id: idlayanan
                    },
                    attributes: ['name', 'code'],
                }),
                Antrian.count({
                    where: {
                        createdAt: {
                            [Op.between]: [startOfDay, endOfDay]
                        },
                        layanan_id: idlayanan
                    }
                }),
                Antrian.count({
                    where: {
                        createdAt: {
                            [Op.between]: [startOfDay, endOfDay]
                        },
                        layanan_id: idlayanan,
                        status: true
                    }
                }),
                Antrian.count({
                    where: {
                        createdAt: {
                            [Op.between]: [startOfDay, endOfDay]
                        },
                        layanan_id: idlayanan,
                        status: true
                    }
                })
            ]);

            const data = {
                LayananData,
                AntrianCount,
                AntrianNumber: AntrianCount === 0 ? 0 : AntrianNumber + 1,
                AntrianClear
            };

            res.status(200).json({
                status: 200,
                message: 'success get',
                data
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: 'Internal server error', error: err });
        }
    },

    panggilAntrianBerikutnya: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            const { sluglayanan } = req.params;

            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            const endOfDay = new Date(today.setHours(23, 59, 59, 999));

            // Cari antrian berikutnya yang belum dipanggil (statusnya false)
            const antrianBerikutnya = await Antrian.findOne({
                where: {
                    status: false,
                    createdAt: {
                        [Op.between]: [startOfDay, endOfDay]
                    },
                },
                include: [
                    {
                        model: Instansi,
                        attributes: ['id', 'name', 'code'],

                    }, {
                        model: Layanan,
                        attributes: ['id', 'name', 'code'],
                        where: {
                            slug: sluglayanan,
                        },
                    }
                ],
                order: [
                    ['createdAt', 'ASC']
                ],
                transaction
            });

            if (!antrianBerikutnya) {
                await transaction.rollback();
                return res.status(404).json({ status: 404, message: 'Tidak ada antrian yang tersedia' });
            }

            // Update status antrian menjadi true (sudah dipanggil)
            antrianBerikutnya.status = true;
            antrianBerikutnya.updatedAt = Date.now();
            await antrianBerikutnya.save({ transaction });

            // Generate suara panggilan antrian
            const panggilanAntrian = `Antrian ${antrianBerikutnya?.code}, silahkan ke loket ${antrianBerikutnya?.Layanan?.code}`;
            const languageCode = 'id';

            const generateAndUploadAudio = async (text, language) => {
                try {
                    const url = await tts.getAudioUrl(text, {
                        lang: language || 'id',
                        slow: false,
                        host: 'https://translate.google.com',
                    });

                    const response = await axios({
                        url,
                        method: 'GET',
                        responseType: 'arraybuffer', // Perlu array buffer untuk membuat Buffer di Node.js
                    });

                    const now = new Date();
                    const datetime = now.toISOString().replace(/[-:.]/g, '');
                    const audioFileName = `antrian_audio_${uuidv4()}_${datetime}.mp3`;

                    const uploadParams = {
                        Bucket: process.env.AWS_S3_BUCKET,
                        Key: `audio/${audioFileName}`,
                        Body: response.data, // Buffer dari response arraybuffer
                        ContentType: 'audio/mpeg',
                        ACL: 'public-read',
                    };

                    const command = new PutObjectCommand(uploadParams);
                    await s3Client.send(command);

                    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;

                    return fileUrl;
                } catch (error) {
                    console.error('Error converting text to speech or uploading to S3:', error);
                    throw error;
                }
            };

            const audioUrl = await generateAndUploadAudio(panggilanAntrian, languageCode);

            antrianBerikutnya.audio = audioUrl;
            await antrianBerikutnya.save({ transaction });

            await transaction.commit();

            res.status(200).json(response(200, 'Panggilan antrian berhasil', antrianBerikutnya));

        } catch (err) {
            await transaction.rollback();
            console.error(err);
            res.status(500).json({ status: 500, message: 'Internal server error', error: err });
        }
    },

    pdfriwayatantrian: async (req, res) => {
        try {
            const idlayanan = data.layanan_id
            const { status, code, range, start_date, end_date } = req.query;

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

            let riwayatAntrian = await Promise.all([ 
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
                })
            ]);

            // Generate HTML content for PDF
            const templatePath = path.resolve(__dirname, '../views/antrian.html');
            let htmlContent = fs.readFileSync(templatePath, 'utf8');
            let layananGet;

            if (idlayanan) {
                layananGet = await Layanan.findOne({
                    where: {
                        id: idlayanan
                    },
                });
            }

            const layananInfo = layananGet?.name ? `<p>Layanan : ${layananGet?.name}</p>` : '';
            let tanggalInfo = '';
            if (startOfToday2 || endOfToday2) {
                const startDateFormatted = startOfToday2 ? new Date(startOfToday2).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
                const endDateFormatted = endOfToday2 ? new Date(endOfToday2).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
                tanggalInfo = `<p>Periode Tanggal : ${startDateFormatted} s.d. ${endDateFormatted ? endDateFormatted : 'Hari ini'} </p>`;
            }
           
            const reportTableRows = riwayatAntrian[0]?.map(antrian => {
                const createdAtDate = new Date(antrian.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
                const createdAtTime = new Date(antrian.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                const updatedAtTime = new Date(antrian.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                const statusText = antrian.status ? 'Selesai' : 'Menunggu';
            
                return `
                    <tr>
                        <td>${antrian.code}</td>
                        <td class="center">${createdAtDate}</td>
                        <td class="center">${createdAtTime} WIB</td>
                        <td class="center">${updatedAtTime} WIB</td>
                        <td class="center">${statusText}</td>
                    </tr>
                `;
            }).join('');
            // <td><img src="${layanan.image}" alt="${layanan.name}" width="50"/></td>

            htmlContent = htmlContent.replace('{{layananInfo}}', layananInfo);
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
}