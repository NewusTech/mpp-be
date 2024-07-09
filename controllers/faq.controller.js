const { response } = require('../helpers/response.formatter');

const { Faq } = require('../models');

const Validator = require("fastest-validator");
const v = new Validator();
const { Op } = require('sequelize');

module.exports = {

    //membuat faq
    createfaq: async (req, res) => {
        try {

            //membuat schema untuk validasi
            const schema = {
                question: {
                    type: "string",
                    min: 3,
                },
                answer: {
                    type: "string",
                    min: 3,
                    optional: true
                },
            }

            //buat object faq
            let faqCreateObj = {
                question: req.body.question,
                answer: req.body.answer,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(faqCreateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //buat faq
            let faqCreate = await Faq.create(faqCreateObj);

            //response menggunakan helper response.formatter
            res.status(201).json(response(201, 'success create faq', faqCreate));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan semua data faq
    getfaq: async (req, res) => {
        try {
            let faqGets;
            const search = req.query.search ?? null;

            if (search) {
                [faqGets] = await Promise.all([
                    Faq.findAll({
                        where: {
                            [Op.or]: [
                                { question: { [Op.iLike]: `%${search}%` } },
                                { answer: { [Op.iLike]: `%${search}%` } }
                            ]
                        },
                    }),
                ]);
            } else {
                [faqGets] = await Promise.all([
                    Faq.findAll({
                    }),
                ]);
            }

            res.status(200).json(response(200, 'success get DATA', faqGets));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan data faq berdasarkan id
    getfaqById: async (req, res) => {
        try {
            //mendapatkan data faq berdasarkan id
            let faqGet = await Faq.findOne({
                where: {
                    id: req.params.id
                },
            });

            //cek jika faq tidak ada
            if (!faqGet) {
                res.status(404).json(response(404, 'faq not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get faq by id', faqGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate faq berdasarkan id
    updatefaq: async (req, res) => {
        try {
            //mendapatkan data faq untuk pengecekan
            let faqGet = await Faq.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data faq ada
            if (!faqGet) {
                res.status(404).json(response(404, 'faq not found'));
                return;
            }

            const oldImagePublicId = faqGet.image ? faqGet.image.split('/').pop().split('.')[0] : null;

            //membuat schema untuk validasi
            const schema = {
                question: {
                    type: "string",
                    min: 3,
                    optional: true
                },
                answer: {
                    type: "string",
                    min: 3,
                    optional: true
                }
            }

            //buat object faq
            let faqUpdateObj = {
                question: req.body.question,
                answer: req.body.answer,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(faqUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update faq
            await Faq.update(faqUpdateObj, {
                where: {
                    id: req.params.id,
                }
            })

            //mendapatkan data faq setelah update
            let faqAfterUpdate = await Faq.findOne({
                where: {
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update faq', faqAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //menghapus faq berdasarkan id
    deletefaq: async (req, res) => {
        try {

            //mendapatkan data faq untuk pengecekan
            let faqGet = await Faq.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data faq ada
            if (!faqGet) {
                res.status(404).json(response(404, 'faq not found'));
                return;
            }

            await Faq.destroy({
                where: {
                    id: req.params.id,
                }
            })

            res.status(200).json(response(200, 'success delete faq'));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    }
}