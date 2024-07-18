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
                status: 0
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
                    include: [{
                        model: Instansi,
                        attributes: ['name'],
                        where: {
                            slug: slugdinas,
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
                    include: [{
                        model: Layanan,
                        attributes: ['name'],
                        where: {
                            slug: sluglayanan,
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

            const [AntrianCount, AntrianNumber, AntrianClear] = await Promise.all([
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
                AntrianCount,
                AntrianNumber: AntrianNumber + 1,
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
                        attributes: ['id', 'name'],
                       
                    }, {
                        model: Layanan,
                        attributes: ['id', 'name'],
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
            await antrianBerikutnya.save({ transaction });

            // Generate suara panggilan antrian
            const panggilanAntrian = `Antrian ${antrianBerikutnya?.code}, silahkan ke loket ${antrianBerikutnya?.Layanan?.name}`;
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
    }
}