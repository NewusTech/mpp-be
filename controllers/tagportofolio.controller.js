//kode dari file Tagportofolio.controller.js

//import helper response formatter
const { response} = require('../helpers/response.formatter');

const { Tagportofolio } = require('../models');

//validasi
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = {

    //membuat tagportofolio
    createtagportofolio : async (req,res) => {
        try {

            //membuat schema untuk validasi
            const schema = {
                title: {
                    type: "string",
                    min: 3,
                }
            }

            //buat object tagportofolio
            let tagportofolioCreateObj = {
                title: req.body.title,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(tagportofolioCreateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //buat tagportofolio
            let tagportofolioCreate = await Tagportofolio.create(tagportofolioCreateObj);

            //response menggunakan helper response.formatter
            res.status(201).json(response(201, 'success create kategori portofolio', tagportofolioCreate));
        }catch (err) {
            res.status(500).json(response(500,'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan semua data tagportofolio
    gettagportofolio : async (req,res) => {
        try {
            //mendapatkan data semua tagportofolio
            let tagportofolioGets = await Tagportofolio.findAll({});

        //response menggunakan helper response.formatter
        res.status(200).json(response(200,'success get tagportofolio', tagportofolioGets));

        } catch (err) {
            res.status(500).json(response(500,'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan data tagportofolio berdasarkan id
    gettagportofolioById : async (req,res) => {
        try{
            //mendapatkan data tagportofolio berdasarkan id
            let tagportofolioGet = await Tagportofolio.findOne({
                where : {
                    id : req.params.id
                },
            });

            //cek jika tagportofolio tidak ada
            if(!tagportofolioGet){
                res.status(404).json(response(404,'tagportofolio not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200,'success get tagportofolio by id', tagportofolioGet));
        }catch (err) {
            res.status(500).json(response(500,'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate tagportofolio berdasarkan id
    updatetagportofolio : async (req, res) => {
        try {
            //mendapatkan data tagportofolio untuk pengecekan
            let tagportofolioGet = await Tagportofolio.findOne({
                where:{
                    id : req.params.id
                }
            })

            //cek apakah data tagportofolio ada
            if(!tagportofolioGet){
                res.status(404).json(response(404,'tagportofolio not found'));
                return;
            }

             //membuat schema untuk validasi
            const schema = {
                title: {
                    type: "string",
                    min: 1,
                }
            }

             //buat object tagportofolio
            let tagportofolioUpdateObj = {
                title: req.body.title,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(tagportofolioUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update tagportofolio
            await Tagportofolio.update(tagportofolioUpdateObj, {
                where:{
                    id: req.params.id,
                }
            })

            //mendapatkan data tagportofolio setelah update
            let tagportofolioAfterUpdate = await Tagportofolio.findOne({
                where:{
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200,'success update tagportofolio', tagportofolioAfterUpdate));
            
        } catch (err) {
            res.status(500).json(response(500,'internal server error', err));
            console.log(err);
        }   
    },

    //menghapus tagportofolio berdasarkan id
    deletetagportofolio: async (req, res) => {
        try {

            //mendapatkan data tagportofolio untuk pengecekan
            let tagportofolioGet = await Tagportofolio.findOne({
                where:{
                    id : req.params.id
                }
            })

            //cek apakah data tagportofolio ada
            if(!tagportofolioGet){
                res.status(404).json(response(404,'tagportofolio not found'));
                return;
            }

            await Tagportofolio.destroy({
                where:{
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200,'success delete tagportofolio'));

        } catch (err) {
            res.status(500).json(response(500,'internal server error', err));
            console.log(err);
        }
    }
}