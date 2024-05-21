const { response } = require('../helpers/response.formatter');

const { Layananform } = require('../models');
require('dotenv').config()

const slugify = require('slugify');
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = {

    //membuat layananform
    createlayananform: async (req, res) => {
        try {

            //membuat schema untuk validasi
            const schema = {
                field: {
                    type: "string",
                    min: 1,
                },
                tipedata: {
                    type: "string",
                    min: 1,
                    optional: true
                },
                maxinput: {
                    type: "number",
                    optional: true
                },
                mininput: {
                    type: "number",
                    optional: true
                },
                status: {
                    type: "number",
                    optional: true
                },
                isrequired: {
                    type: "number",
                    optional: true
                },
                layanan_id: {
                    type: "number",
                    optional: true
                },
            }

            //buat object layananform
            let layananformCreateObj = {
                field: req.body.field,
                tipedata: req.body.tipedata,
                maxinput: Number(req.body.maxinput),
                mininput: Number(req.body.mininput),
                isrequired: Number(req.body.isrequired),
                status: Number(req.body.status),
                layanan_id: req.body.layanan_id !== undefined ? Number(req.body.layanan_id) : null,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(layananformCreateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //buat layananform
            let layananformCreate = await Layananform.create(layananformCreateObj);

            //response menggunakan helper response.formatter
            res.status(201).json(response(201, 'success create layananform', layananformCreate));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan semua data layananform
    getlayananform: async (req, res) => {
        try {
            //mendapatkan data semua layananform
            let layananformGets = await Layananform.findAll({});

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get layananform', layananformGets));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan data layananform berdasarkan id
    getlayananformById: async (req, res) => {
        try {
            //mendapatkan data layananform berdasarkan id
            let layananformGet = await Layananform.findOne({
                where: {
                    id: req.params.id
                },
            });

            //cek jika layananform tidak ada
            if (!layananformGet) {
                res.status(404).json(response(404, 'layananform not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get layananform by id', layananformGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate layananform berdasarkan id
    updatelayananform: async (req, res) => {
        try {
            //mendapatkan data layananform untuk pengecekan
            let layananformGet = await Layananform.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data layananform ada
            if (!layananformGet) {
                res.status(404).json(response(404, 'layananform not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                field: {
                    type: "string",
                    min: 1,
                },
                tipedata: {
                    type: "string",
                    min: 1,
                    optional: true
                },
                maxinput: {
                    type: "number",
                    optional: true
                },
                mininput: {
                    type: "number",
                    optional: true
                },
                status: {
                    type: "number",
                    optional: true
                },
                isrequired: {
                    type: "number",
                    optional: true
                },
                layanan_id: {
                    type: "number",
                    optional: true
                },
            }

            //buat object layananform
            let layananformUpdateObj = {
                field: req.body.field,
                tipedata: req.body.tipedata,
                maxinput: Number(req.body.maxinput),
                mininput: Number(req.body.mininput),
                isrequired: Number(req.body.isrequired),
                status: Number(req.body.status),
                layanan_id: req.body.layanan_id !== undefined ? Number(req.body.layanan_id) : null,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(layananformUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update layananform
            await Layananform.update(layananformUpdateObj, {
                where: {
                    id: req.params.id,
                }
            })

            //mendapatkan data layananform setelah update
            let layananformAfterUpdate = await Layananform.findOne({
                where: {
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update layananform', layananformAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //menghapus layananform berdasarkan id
    deletelayananform: async (req, res) => {
        try {

            //mendapatkan data layananform untuk pengecekan
            let layananformGet = await Layananform.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data layananform ada
            if (!layananformGet) {
                res.status(404).json(response(404, 'layananform not found'));
                return;
            }

            await Layananform.destroy({
                where: {
                    id: req.params.id,
                }
            })

            res.status(200).json(response(200, 'success delete layananformGet'));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },
    
}