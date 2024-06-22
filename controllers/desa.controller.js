const { response } = require('../helpers/response.formatter');

const { Desa } = require('../models');

const Validator = require("fastest-validator");
const v = new Validator();
const { Op } = require('sequelize');

module.exports = {

    //mendapatkan semua data desa
    getdesa: async (req, res) => {
        try {
            let desaGets;
            const search = req.query.search ?? null;
            const kecamatan_id = req.query.kecamatan_id ?? null;

            let filter = {};

            if (search) {
                filter.name = { [Op.iLike]: `%${search}%` };
            }
    
            if (kecamatan_id) {
                filter.kecamatan_id = kecamatan_id;
            }

            [desaGets] = await Promise.all([
                Desa.findAll({
                    where: filter,
                }),
            ]);

            res.status(200).json(response(200, 'success get DATA', desaGets));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan data desa berdasarkan id
    getdesaById: async (req, res) => {
        try {
            //mendapatkan data desa berdasarkan id
            let desaGet = await Desa.findOne({
                where: {
                    id: req.params.id
                },
            });

            //cek jika desa tidak ada
            if (!desaGet) {
                res.status(404).json(response(404, 'desa not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get desa by id', desaGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },
}