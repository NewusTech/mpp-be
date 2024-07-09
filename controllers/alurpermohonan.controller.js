const { response } = require('../helpers/response.formatter');

const { Alurpermohonan } = require('../models');

const Validator = require("fastest-validator");
const v = new Validator();
const { Op } = require('sequelize');

module.exports = {

    //membuat alurpermohonan
    createalurpermohonan: async (req, res) => {
        try {

            //membuat schema untuk validasi
            const schema = {
                desc: {
                    type: "string",
                    min: 3,
                },
            }

            //buat object alurpermohonan
            let alurpermohonanCreateObj = {
                desc: req.body.desc
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(alurpermohonanCreateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //buat alurpermohonan
            let alurpermohonanCreate = await Alurpermohonan.create(alurpermohonanCreateObj);

            //response menggunakan helper response.formatter
            res.status(201).json(response(201, 'success create alurpermohonan', alurpermohonanCreate));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan semua data alurpermohonan
    getalurpermohonan: async (req, res) => {
        try {
            let alurpermohonanGets;

            [alurpermohonanGets] = await Promise.all([
                Alurpermohonan.findAll({
                    order: [['id', 'ASC']]
                }),
            ]);

            res.status(200).json(response(200, 'success get DATA', alurpermohonanGets));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan data alurpermohonan berdasarkan id
    getalurpermohonanById: async (req, res) => {
        try {
            //mendapatkan data alurpermohonan berdasarkan id
            let alurpermohonanGet = await Alurpermohonan.findOne({
                where: {
                    id: req.params.id
                },
            });

            //cek jika alurpermohonan tidak ada
            if (!alurpermohonanGet) {
                res.status(404).json(response(404, 'alurpermohonan not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get alurpermohonan by id', alurpermohonanGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate alurpermohonan berdasarkan id
    updatealurpermohonan: async (req, res) => {
        try {
            //mendapatkan data alurpermohonan untuk pengecekan
            let alurpermohonanGet = await Alurpermohonan.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data alurpermohonan ada
            if (!alurpermohonanGet) {
                res.status(404).json(response(404, 'alurpermohonan not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                desc: {
                    type: "string",
                    min: 3,
                    optional: true
                },
            }

            //buat object alurpermohonan
            let alurpermohonanUpdateObj = {
                desc: req.body.desc,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(alurpermohonanUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update alurpermohonan
            await Alurpermohonan.update(alurpermohonanUpdateObj, {
                where: {
                    id: req.params.id,
                }
            })

            //mendapatkan data alurpermohonan setelah update
            let alurpermohonanAfterUpdate = await Alurpermohonan.findOne({
                where: {
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update alurpermohonan', alurpermohonanAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //menghapus alurpermohonan berdasarkan id
    deletealurpermohonan: async (req, res) => {
        try {

            //mendapatkan data alurpermohonan untuk pengecekan
            let alurpermohonanGet = await Alurpermohonan.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data alurpermohonan ada
            if (!alurpermohonanGet) {
                res.status(404).json(response(404, 'alurpermohonan not found'));
                return;
            }

            await Alurpermohonan.destroy({
                where: {
                    id: req.params.id,
                }
            })

            res.status(200).json(response(200, 'success delete alurpermohonan'));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    }
}