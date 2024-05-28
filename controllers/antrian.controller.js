const { response } = require('../helpers/response.formatter');

const { Antrian, Instansi } = require('../models');

const slugify = require('slugify');
const Validator = require("fastest-validator");
const v = new Validator();
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

    getantrian: async (req, res) => {
        try {
            const { idInstansi } = req.params;

            // Validasi apakah instansi (dinas) ada
            const instansi = await Instansi.findByPk(idInstansi);
            if (!instansi) {
                return res.status(404).json({ status: 404, message: 'Instansi not found' });
            }

            // Mendapatkan rentang tanggal untuk hari ini
            const startOfToday = moment().startOf('day').toDate();
            const endOfToday = moment().endOf('day').toDate();

            // Query untuk mendapatkan antrian berdasarkan id dinas khusus hari ini
            const antrianHariIni = await Antrian.findAll({
                where: {
                    instansi_id: idInstansi,
                    createdAt: {
                        [Op.between]: [startOfToday, endOfToday]
                    }
                }
            });

            // Mengembalikan response
            res.status(200).json({ status: 200, message: 'Success', data: antrianHariIni });
        } catch (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: 'Internal server error', error: err });
        }
    },

    //menghapus antrian berdasarkan id
    deleteantrian: async (req, res) => {
        try {
            const { startDateTime, endDateTime, deleteAll } = req.body;

            // Jika perintah adalah untuk menghapus semua data
            if (deleteAll) {
                const deleted = await Antrian.destroy({
                    where: {}
                });
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

            // Hapus data antrian dalam rentang tanggal dan waktu tersebut
            const deleted = await Antrian.destroy({
                where: {
                    createdAt: dateTimeRange
                }
            });

            // Mengembalikan response
            res.status(200).json({ status: 200, message: `${deleted} antrian(s) deleted successfully` });
        } catch (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: 'Internal server error', error: err });
        }
    }

}