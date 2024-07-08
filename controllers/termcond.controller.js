const { response } = require('../helpers/response.formatter');

const { Termcond } = require('../models');

const Validator = require("fastest-validator");
const v = new Validator();
const { Op } = require('sequelize');

module.exports = {

    //mendapatkan data termcond berdasarkan id
    gettermcond: async (req, res) => {
        try {
            //mendapatkan data termcond berdasarkan id
            let termcondGet = await Termcond.findOne();

            //cek jika termcond tidak ada
            if (!termcondGet) {
                res.status(404).json(response(404, 'termcond not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get termcond by id', termcondGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate termcond berdasarkan id
    updatetermcond: async (req, res) => {
        try {
            //mendapatkan data termcond untuk pengecekan
            let termcondGet = await Termcond.findOne()

            //cek apakah data termcond ada
            if (!termcondGet) {
                res.status(404).json(response(404, 'termcond not found'));
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

            //buat object termcond
            let termcondUpdateObj = {
                desc: req.body.desc
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(termcondUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update termcond
            await Termcond.update(termcondUpdateObj, {
                where: {
                  id: termcondGet.id,
                },
              });

            //mendapatkan data termcond setelah update
            let termcondAfterUpdate = await Termcond.findOne()

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update termcond', termcondAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

}