const { response } = require('../helpers/response.formatter');

const { Alurbooking } = require('../models');

const Validator = require("fastest-validator");
const v = new Validator();
const { Op } = require('sequelize');

module.exports = {

    //membuat alurbooking
    createalurbooking: async (req, res) => {
        try {

            //membuat schema untuk validasi
            const schema = {
                desc: {
                    type: "string",
                    min: 3,
                },
            }

            //buat object alurbooking
            let alurbookingCreateObj = {
                desc: req.body.desc
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(alurbookingCreateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //buat alurbooking
            let alurbookingCreate = await Alurbooking.create(alurbookingCreateObj);

            //response menggunakan helper response.formatter
            res.status(201).json(response(201, 'success create alurbooking', alurbookingCreate));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan semua data alurbooking
    getalurbooking: async (req, res) => {
        try {
            let alurbookingGets;

            [alurbookingGets] = await Promise.all([
                Alurbooking.findAll({}),
            ]);

            res.status(200).json(response(200, 'success get DATA', alurbookingGets));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan data alurbooking berdasarkan id
    getalurbookingById: async (req, res) => {
        try {
            //mendapatkan data alurbooking berdasarkan id
            let alurbookingGet = await Alurbooking.findOne({
                where: {
                    id: req.params.id
                },
            });

            //cek jika alurbooking tidak ada
            if (!alurbookingGet) {
                res.status(404).json(response(404, 'alurbooking not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get alurbooking by id', alurbookingGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate alurbooking berdasarkan id
    updatealurbooking: async (req, res) => {
        try {
            //mendapatkan data alurbooking untuk pengecekan
            let alurbookingGet = await Alurbooking.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data alurbooking ada
            if (!alurbookingGet) {
                res.status(404).json(response(404, 'alurbooking not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                desc: {
                    type: "string",
                    min: 3,
                },
            }

            //buat object alurbooking
            let alurbookingUpdateObj = {
                desc: req.body.desc,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(alurbookingUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update alurbooking
            await Alurbooking.update(alurbookingUpdateObj, {
                where: {
                    id: req.params.id,
                }
            })

            //mendapatkan data alurbooking setelah update
            let alurbookingAfterUpdate = await Alurbooking.findOne({
                where: {
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update alurbooking', alurbookingAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //menghapus alurbooking berdasarkan id
    deletealurbooking: async (req, res) => {
        try {

            //mendapatkan data alurbooking untuk pengecekan
            let alurbookingGet = await Alurbooking.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data alurbooking ada
            if (!alurbookingGet) {
                res.status(404).json(response(404, 'alurbooking not found'));
                return;
            }

            await Alurbooking.destroy({
                where: {
                    id: req.params.id,
                }
            })

            res.status(200).json(response(200, 'success delete alurbooking'));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    }
}