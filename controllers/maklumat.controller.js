const { response } = require('../helpers/response.formatter');

const { Maklumat, Logo, Instansi } = require('../models');

const Validator = require("fastest-validator");
const v = new Validator();
const { Op } = require('sequelize');

module.exports = {

    //mendapatkan data maklumat berdasarkan id
    get: async (req, res) => {
        try {
            //mendapatkan data maklumat berdasarkan id
            let maklumatGet = await Maklumat.findOne({
                attributes: ['desc']
            });

            let logoGet = await Logo.findOne({
                attributes: ['logo_mpp', 'logo_lamtim']
            });

            let instansi = await Instansi.findAll({
                attributes: ['name', 'image']
            })

            //cek jika maklumat tidak ada
            if (!maklumatGet) {
                res.status(404).json(response(404, 'maklumat not found'));
                return;
            }

            let data = {
                maklumat: maklumatGet,
                logo: logoGet,
                instansi: instansi
            };

            // Response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get maklumat and logo', data));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate maklumat berdasarkan id
    update: async (req, res) => {
        try {
            //mendapatkan data maklumat untuk pengecekan
            let maklumatGet = await Maklumat.findOne()

            //cek apakah data maklumat ada
            if (!maklumatGet) {
                res.status(404).json(response(404, 'maklumat not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                desc: {
                    type: "string",
                    min: 3,
                    optional: true
                }
            }

            //buat object maklumat
            let maklumatUpdateObj = {
                desc: req.body.desc,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(maklumatUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update maklumat
            await Maklumat.update(maklumatUpdateObj, {
                where: {
                    id: maklumatGet.id,
                },
            });

            //mendapatkan data maklumat setelah update
            let maklumatAfterUpdate = await Maklumat.findOne()

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update maklumat', maklumatAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

}