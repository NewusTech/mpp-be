//kode dari file Kategoriblog.controller.js

//import helper response formatter
const { response} = require('../helpers/response.formatter');

const { Kategoriblog } = require('../models');

//validasi
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = {

    //membuat kategoriblog
    createkategoriblog : async (req,res) => {
        try {

            //membuat schema untuk validasi
            const schema = {
                title: {
                    type: "string",
                    min: 3,
                }
            }

            //buat object kategoriblog
            let kategoriblogCreateObj = {
                title: req.body.title,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(kategoriblogCreateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //buat kategoriblog
            let kategoriblogCreate = await Kategoriblog.create(kategoriblogCreateObj);

            //response menggunakan helper response.formatter
            res.status(201).json(response(201, 'success create kategori blog', kategoriblogCreate));
        }catch (err) {
            res.status(500).json(response(500,'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan semua data kategoriblog
    getkategoriblog : async (req,res) => {
        try {
            console.log("anjing")
            //mendapatkan data semua kategoriblog
            let kategoriblogGets = await Kategoriblog.findAll({});

        //response menggunakan helper response.formatter
        res.status(200).json(response(200,'success get kategoriblog', kategoriblogGets));

        } catch (err) {
            res.status(500).json(response(500,'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan data kategoriblog berdasarkan id
    getkategoriblogById : async (req,res) => {
        try{
            //mendapatkan data kategoriblog berdasarkan id
            let kategoriblogGet = await Kategoriblog.findOne({
                where : {
                    id : req.params.id
                },
            });

            //cek jika kategoriblog tidak ada
            if(!kategoriblogGet){
                res.status(404).json(response(404,'kategoriblog not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200,'success get kategoriblog by id', kategoriblogGet));
        }catch (err) {
            res.status(500).json(response(500,'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate kategoriblog berdasarkan id
    updatekategoriblog : async (req, res) => {
        try {
            //mendapatkan data kategoriblog untuk pengecekan
            let kategoriblogGet = await Kategoriblog.findOne({
                where:{
                    id : req.params.id
                }
            })

            //cek apakah data kategoriblog ada
            if(!kategoriblogGet){
                res.status(404).json(response(404,'kategoriblog not found'));
                return;
            }

             //membuat schema untuk validasi
            const schema = {
                title: {
                    type: "string",
                    min: 1,
                }
            }

             //buat object kategoriblog
            let kategoriblogUpdateObj = {
                title: req.body.title,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(kategoriblogUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update kategoriblog
            await Kategoriblog.update(kategoriblogUpdateObj, {
                where:{
                    id: req.params.id,
                }
            })

            //mendapatkan data kategoriblog setelah update
            let kategoriblogAfterUpdate = await Kategoriblog.findOne({
                where:{
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200,'success update kategoriblog', kategoriblogAfterUpdate));
            
        } catch (err) {
            res.status(500).json(response(500,'internal server error', err));
            console.log(err);
        }   
    },

    //menghapus kategoriblog berdasarkan id
    deletekategoriblog: async (req, res) => {
        try {

            //mendapatkan data kategoriblog untuk pengecekan
            let kategoriblogGet = await Kategoriblog.findOne({
                where:{
                    id : req.params.id
                }
            })

            //cek apakah data kategoriblog ada
            if(!kategoriblogGet){
                res.status(404).json(response(404,'kategoriblog not found'));
                return;
            }

            await Kategoriblog.destroy({
                where:{
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200,'success delete kategoriblog'));

        } catch (err) {
            res.status(500).json(response(500,'internal server error', err));
            console.log(err);
        }
    }
}