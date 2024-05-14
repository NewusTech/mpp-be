//kode dari file Kategoriportofolio.controller.js

//import helper response formatter
const { response} = require('../helpers/response.formatter');

const { Kategoriportofolio } = require('../models');

//validasi
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = {

    //membuat kategoriportofolio
    createkategoriportofolio : async (req,res) => {
        try {

            //membuat schema untuk validasi
            const schema = {
                title: {
                    type: "string",
                    min: 3,
                }
            }

            //buat object kategoriportofolio
            let kategoriportofolioCreateObj = {
                title: req.body.title,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(kategoriportofolioCreateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //buat kategoriportofolio
            let kategoriportofolioCreate = await Kategoriportofolio.create(kategoriportofolioCreateObj);

            //response menggunakan helper response.formatter
            res.status(201).json(response(201, 'success create kategori portofolio', kategoriportofolioCreate));
        }catch (err) {
            res.status(500).json(response(500,'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan semua data kategoriportofolio
    getkategoriportofolio : async (req,res) => {
        try {
            console.log("anjing")
            //mendapatkan data semua kategoriportofolio
            let kategoriportofolioGets = await Kategoriportofolio.findAll({});

        //response menggunakan helper response.formatter
        res.status(200).json(response(200,'success get kategoriportofolio', kategoriportofolioGets));

        } catch (err) {
            res.status(500).json(response(500,'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan data kategoriportofolio berdasarkan id
    getkategoriportofolioById : async (req,res) => {
        try{
            //mendapatkan data kategoriportofolio berdasarkan id
            let kategoriportofolioGet = await Kategoriportofolio.findOne({
                where : {
                    id : req.params.id
                },
            });

            //cek jika kategoriportofolio tidak ada
            if(!kategoriportofolioGet){
                res.status(404).json(response(404,'kategoriportofolio not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200,'success get kategoriportofolio by id', kategoriportofolioGet));
        }catch (err) {
            res.status(500).json(response(500,'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate kategoriportofolio berdasarkan id
    updatekategoriportofolio : async (req, res) => {
        try {
            //mendapatkan data kategoriportofolio untuk pengecekan
            let kategoriportofolioGet = await Kategoriportofolio.findOne({
                where:{
                    id : req.params.id
                }
            })

            //cek apakah data kategoriportofolio ada
            if(!kategoriportofolioGet){
                res.status(404).json(response(404,'kategoriportofolio not found'));
                return;
            }

             //membuat schema untuk validasi
            const schema = {
                title: {
                    type: "string",
                    min: 1,
                }
            }

             //buat object kategoriportofolio
            let kategoriportofolioUpdateObj = {
                title: req.body.title,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(kategoriportofolioUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update kategoriportofolio
            await Kategoriportofolio.update(kategoriportofolioUpdateObj, {
                where:{
                    id: req.params.id,
                }
            })

            //mendapatkan data kategoriportofolio setelah update
            let kategoriportofolioAfterUpdate = await Kategoriportofolio.findOne({
                where:{
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200,'success update kategoriportofolio', kategoriportofolioAfterUpdate));
            
        } catch (err) {
            res.status(500).json(response(500,'internal server error', err));
            console.log(err);
        }   
    },

    //menghapus kategoriportofolio berdasarkan id
    deletekategoriportofolio: async (req, res) => {
        try {

            //mendapatkan data kategoriportofolio untuk pengecekan
            let kategoriportofolioGet = await Kategoriportofolio.findOne({
                where:{
                    id : req.params.id
                }
            })

            //cek apakah data kategoriportofolio ada
            if(!kategoriportofolioGet){
                res.status(404).json(response(404,'kategoriportofolio not found'));
                return;
            }

            await Kategoriportofolio.destroy({
                where:{
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200,'success delete kategoriportofolio'));

        } catch (err) {
            res.status(500).json(response(500,'internal server error', err));
            console.log(err);
        }
    }
}