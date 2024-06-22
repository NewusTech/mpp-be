const { response } = require('../helpers/response.formatter');

const { Kecamatan } = require('../models');

const Validator = require("fastest-validator");
const v = new Validator();
const { Op } = require('sequelize');

module.exports = {

    //mendapatkan semua data kecamatan
    getkecamatan: async (req, res) => {
        try {
            let kecamatanGets;
            const search = req.query.search ?? null;

            if (search) {
                [kecamatanGets] = await Promise.all([
                    Kecamatan.findAll({
                        where: {
                           name: { [Op.iLike]: `%${search}%` } 
                        },
                    }),
                ]);
            } else {
                [kecamatanGets] = await Promise.all([
                    Kecamatan.findAll({
                    }),
                ]);
            }

            res.status(200).json(response(200, 'success get DATA', kecamatanGets));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan data kecamatan berdasarkan id
    getkecamatanById: async (req, res) => {
        try {
            //mendapatkan data kecamatan berdasarkan id
            let kecamatanGet = await Kecamatan.findOne({
                where: {
                    id: req.params.id
                },
            });

            //cek jika kecamatan tidak ada
            if (!kecamatanGet) {
                res.status(404).json(response(404, 'kecamatan not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get kecamatan by id', kecamatanGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },
}