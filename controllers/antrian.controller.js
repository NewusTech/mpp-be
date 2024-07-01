const { response } = require('../helpers/response.formatter');

const { Antrian, Instansi, sequelize } = require('../models');

const tts = require('google-tts-api');
const axios = require('axios');
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
    }
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

            // Mendapatkan tanggal hari ini
            const today = new Date().toISOString().split('T')[0];

            const instansi = await Instansi.findByPk(req.body.instansi_id);
            if (!instansi) {
                return res.status(404).json({ status: 404, message: 'Instansi not found' });
            }

            const existingAntrian = await Antrian.findAll({
                where: {
                    instansi_id: req.body.instansi_id,
                    createdAt: {
                        [Sequelize.Op.gte]: new Date(today)
                    }
                }
            });

            // const newNumber = existingAntrian.length + 1;
            // const instansiCode = numberToAlphabeticCode(req.body.instansi_id);
            // const codeBooking = `${instansiCode}${String(newNumber).padStart(3, '0')}`;

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

    // getantrian: async (req, res) => {
    //     try {
    //         const { slugdinas } = req.params;

    //         const page = parseInt(req.query.page) || 1;
    //         const limit = parseInt(req.query.limit) || 10;
    //         const offset = (page - 1) * limit;

    //         let antrianHariIni;
    //         let totalCount;

    //         // Validasi apakah instansi (dinas) ada
    //         const instansi = await Instansi.findOne({
    //             where: {
    //                 slug: slugdinas
    //             }
    //         });
    //         if (!instansi) {
    //             return res.status(404).json({ status: 404, message: 'Instansi not found' });
    //         }

    //         // Mendapatkan rentang tanggal untuk hari ini
    //         const startOfToday = moment().startOf('day').toDate();
    //         const endOfToday = moment().endOf('day').toDate();

    //         [antrianHariIni, totalCount] = await Promise.all([
    //             Antrian.findAll({
    //                 where: {
    //                     createdAt: {
    //                         [Op.between]: [startOfToday, endOfToday]
    //                     }
    //                 },
    //                 include: [{
    //                     model: Instansi,
    //                     attributes: ['name'],
    //                     where: {
    //                         slug: slugdinas,
    //                     },
    //                 }],
    //                 limit: limit,
    //                 offset: offset
    //             }),
    //             Antrian.count(
    //                 {
    //                     where: {
    //                         createdAt: {
    //                             [Op.between]: [startOfToday, endOfToday]
    //                         }
    //                     },
    //                     include: [{
    //                         model: Instansi,
    //                         where: {
    //                             slug: slugdinas,
    //                         },
    //                     }]
    //                 }
    //             )
    //         ]);

    //         const pagination = generatePagination(totalCount, page, limit, `/api/user/antrian/get/${req.params.slugdinas}`);

    //         res.status(200).json({
    //             status: 200,
    //             message: 'success get',
    //             data: antrianHariIni,
    //             pagination: pagination
    //         });
    //     } catch (err) {
    //         console.error(err);
    //         res.status(500).json({ status: 500, message: 'Internal server error', error: err });
    //     }
    // },

    //menghapus antrian berdasarkan id
    
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

    panggilAntrianBerikutnya: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            const { slugdinas } = req.params;

            // Validasi apakah instansi (dinas) ada
            const instansi = await Instansi.findOne({
                where: {
                    slug: slugdinas
                }
            });
            if (!instansi) {
                await transaction.rollback();
                return res.status(404).json({ status: 404, message: 'Instansi not found' });
            }

            // Cari antrian berikutnya yang belum dipanggil (statusnya false)
            const antrianBerikutnya = await Antrian.findOne({
                where: {
                    status: false
                },
                include: [{
                    model: Instansi,
                    attributes: ['id', 'name'],
                    where: {
                        slug: slugdinas,
                    },
                }],
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
            const panggilanAntrian = `Antrian ${antrianBerikutnya.code}, silahkan ke loket ${antrianBerikutnya.Instansi.name}`;
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