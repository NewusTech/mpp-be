const { response } = require('../helpers/response.formatter');

const { Surveyform, Instansi } = require('../models');
require('dotenv').config()

const { Op } = require('sequelize');
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = {

    // LAYANAN FORM

    //membuat surveyform
    createsurveyform: async (req, res) => {
        try {

            //membuat schema untuk validasi
            const schema = {
                field: {
                    type: "string",
                    min: 1,
                },
                status: {
                    type: "number",
                    optional: true
                },
                instansi_id: {
                    type: "number",
                    optional: true
                },
            }

            //buat object surveyform
            let surveyformCreateObj = {
                field: req.body.field,
                status: Number(req.body.status),
                instansi_id: req.body.instansi_id !== undefined ? Number(req.body.instansi_id) : null,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(surveyformCreateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //buat surveyform
            let surveyformCreate = await Surveyform.create(surveyformCreateObj);

            //response menggunakan helper response.formatter
            res.status(201).json(response(201, 'success create surveyform', surveyformCreate));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan semua form berdasarkan dinas
    getsurveybydinas: async (req, res) => {
        try {
            const { instansiid } = req.params;

            let layananData = await Instansi.findOne({
                where: {
                    id: instansiid
                },
                attributes: ['name', 'slug', 'desc', 'image'],
                include: [
                    {
                        model: Surveyform,
                        attributes: { exclude: ['createdAt', 'updatedAt'] },
                        where: {
                            status: true
                        }
                    }
                ]
            });

            if (!layananData) {
                return res.status(404).json(response(404, 'Survey not found'));
            }

            // Response menggunakan helper response.formatter
            res.status(200).json(response(200, 'Success get survey', layananData));
        } catch (err) {
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

    //mengupdate surveyform berdasarkan id
    updatesurveyform: async (req, res) => {
        try {
            //mendapatkan data surveyform untuk pengecekan
            let surveyformGet = await Surveyform.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data surveyform ada
            if (!surveyformGet) {
                res.status(404).json(response(404, 'surveyform not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                field: {
                    type: "string",
                    min: 1,
                },
                status: {
                    type: "number",
                    optional: true
                },
                layanan_id: {
                    type: "number",
                    optional: true
                },
            }

            //buat object surveyform
            let surveyformUpdateObj = {
                field: req.body.field,
                status: Number(req.body.status),
                layanan_id: req.body.layanan_id !== undefined ? Number(req.body.layanan_id) : null,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(surveyformUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update surveyform
            await Surveyform.update(surveyformUpdateObj, {
                where: {
                    id: req.params.id,
                }
            })

            //mendapatkan data surveyform setelah update
            let surveyformAfterUpdate = await Surveyform.findOne({
                where: {
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update surveyform', surveyformAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //menghapus surveyform berdasarkan id
    deletesurveyform: async (req, res) => {
        try {

            //mendapatkan data surveyform untuk pengecekan
            let surveyformGet = await Surveyform.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data surveyform ada
            if (!surveyformGet) {
                res.status(404).json(response(404, 'surveyform not found'));
                return;
            }

            await Surveyform.destroy({
                where: {
                    id: req.params.id,
                }
            })

            res.status(200).json(response(200, 'success delete surveyformGet'));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

}