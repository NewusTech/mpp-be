const { response } = require('../helpers/response.formatter');

const { Visimisi } = require('../models');

const Validator = require("fastest-validator");
const v = new Validator();
const { Op } = require('sequelize');

module.exports = {

    //mendapatkan data visimisi berdasarkan id
    getvisimisi: async (req, res) => {
        try {
            //mendapatkan data visimisi berdasarkan id
            let visimisiGet = await Visimisi.findOne();

            //cek jika visimisi tidak ada
            if (!visimisiGet) {
                res.status(404).json(response(404, 'visimisi not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get visimisi by id', visimisiGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate visimisi berdasarkan id
    updatevisimisi: async (req, res) => {
        try {
            //mendapatkan data visimisi untuk pengecekan
            let visimisiGet = await Visimisi.findOne()

            //cek apakah data visimisi ada
            if (!visimisiGet) {
                res.status(404).json(response(404, 'visimisi not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                visi: {
                    type: "string",
                    min: 3,
                    optional: true
                },
                misi: {
                    type: "string",
                    min: 3,
                    optional: true
                }
            }

            //buat object visimisi
            let visimisiUpdateObj = {
                visi: req.body.visi,
                misi: req.body.misi,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(visimisiUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update visimisi
            await Visimisi.update(visimisiUpdateObj, {
                where: {
                  id: visimisiGet.id,
                },
              });

            //mendapatkan data visimisi setelah update
            let visimisiAfterUpdate = await Visimisi.findOne()

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update visimisi', visimisiAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

}