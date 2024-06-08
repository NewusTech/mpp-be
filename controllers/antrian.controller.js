const { response } = require('../helpers/response.formatter');

const { Antrian, Instansi, sequelize } = require('../models');

const tts = require('google-tts-api');
const axios = require('axios');
const QRCode = require('qrcode');
const Validator = require("fastest-validator");
const v = new Validator();
const { generatePagination } = require('../pagination/pagination');
const moment = require('moment-timezone');
const cloudinary = require("cloudinary").v2;

const { Sequelize, Op } = require('sequelize');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

module.exports = {

    // membuat antrian OFFLINE
    createantrian: async (req, res) => {
        try {
            const schema = {
                instansi_id: { type: "number" },
                layanan_id: { type: "number" },
            };

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

            const newNumber = existingAntrian.length + 1;
            const codeBooking = `${instansi.name.charAt(0)}${String(newNumber).padStart(3, '0')}`;

            const antrianCreateObj = {
                code: codeBooking,
                instansi_id: Number(req.body.instansi_id),
                layanan_id: Number(req.body.layanan_id),
                userinfo_id: userinfo_id ?? null,
                status: 0
            };

            const validate = v.validate(antrianCreateObj, schema);
            if (validate.length > 0) {
                return res.status(400).json({ status: 400, message: 'Validation failed', errors: validate });
            }

            if (userinfo_id) {
                const qrCodeDataUri = await QRCode.toDataURL(codeBooking);
                
                const now = new Date();
                const datetime = now.toISOString().replace(/[-:.]/g, ''); // Format: YYYYMMDDTHHMMSS
    
                const codeBookingfix = `${codeBooking}_${datetime}`;

                const result = await cloudinary.uploader.upload(qrCodeDataUri, {
                    folder: "mpp/qrcode",
                    public_id: codeBookingfix,
                });

                antrianCreateObj.qrcode = result.secure_url;
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

    //menghapus antrian berdasarkan id
    deleteantrian: async (req, res) => {
        let transaction;
        try {
            const { startDateTime, endDateTime, deleteAll } = req.body;
    
            transaction = await sequelize.transaction();
    
            if (deleteAll) {
                 // Menghapus audio di Cloudinary
                 const antrianAudio = await Antrian.findAll({
                    where: {
                        instansi_id: data.instansi_id
                    },
                    attributes: ['audio', 'qrcode'],
                    transaction
                });
    
                await Promise.all(antrianAudio.map(async antrian => {
                    if (antrian.audio) {
                        const publicId = antrian.audio.split('/').slice(-3).join('/').split('.')[0];
                        await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
                    }
                }));
    
                await Promise.all(antrianAudio.map(async antrian => {
                    if (antrian.qrcode) {
                        const publicId = antrian.qrcode.split('/').pop().split('.')[0];
                        await cloudinary.uploader.destroy(`mpp/qrcode/${publicId}`);
                    }
                }));
    
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

            await Promise.all(antrianAudio.map(async antrian => {
                if (antrian.audio) {
                    const publicId = antrian.audio.split('/').slice(-3).join('/').split('.')[0];
                    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
                }

                if (antrian.qrcode) {
                    const publicId = antrian.qrcode.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`mpp/qrcode/${publicId}`);
                }
            }));
    
            await transaction.commit();
    
            // Mengembalikan response
            res.status(200).json({ status: 200, message: `${deleted} antrian(s) deleted successfully` });
        } catch (err) {
            if (transaction) await transaction.rollback();
            console.error(err);
            res.status(500).json({ status: 500, message: 'Internal server error', error: err });
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
                    attributes: ['id'],
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
            const panggilanAntrian = `Antrian ${antrianBerikutnya.code} silahkan ke loket`;
            const languageCode = 'id';

            // Fungsi untuk konversi teks menjadi suara dan mengunggah langsung ke Cloudinary
            const generateAndUploadAudio = async (text, language, publicId) => {
                try {
                    const url = await tts.getAudioUrl(text, {
                        lang: language || 'id',
                        slow: false,
                        host: 'https://translate.google.com',
                    });

                    const response = await axios({
                        url,
                        method: 'GET',
                        responseType: 'stream'
                    });

                    return new Promise((resolve, reject) => {
                        const stream = cloudinary.uploader.upload_stream({
                            resource_type: 'video', // For audio files
                            folder: 'mpp/antrian_audio',
                            public_id: publicId
                        }, (error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result.secure_url);
                            }
                        });

                        response.data.pipe(stream);
                    });
                } catch (error) {
                    console.error('Error converting text to speech:', error);
                    throw error;
                }
            };

            const now = new Date();
            const datetime = now.toISOString().replace(/[-:.]/g, ''); // Format: YYYYMMDDTHHMMSS

            const audioUrl = await generateAndUploadAudio(panggilanAntrian, languageCode, `antrian_${antrianBerikutnya.code}_${datetime}`);

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