//kode dari file Tagblog.controller.js

//import helper response formatter
const { response} = require('../helpers/response.formatter');

const { Tagblog } = require('../models');

//validasi
const Validator = require("fastest-validator");
const v = new Validator();

module.exports = {

    //membuat tagblog
    createtagblog : async (req,res) => {
        try {

            //membuat schema untuk validasi
            const schema = {
                title: {
                    type: "string",
                    min: 3,
                }
            }

            //buat object tagblog
            let tagblogCreateObj = {
                title: req.body.title,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(tagblogCreateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //buat tagblog
            let tagblogCreate = await Tagblog.create(tagblogCreateObj);

            //response menggunakan helper response.formatter
            res.status(201).json(response(201, 'success create kategori blog', tagblogCreate));
        }catch (err) {
            res.status(500).json(response(500,'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan semua data tagblog
    gettagblog : async (req,res) => {
        try {
            //mendapatkan data semua tagblog
            let tagblogGets = await Tagblog.findAll({});

        //response menggunakan helper response.formatter
        res.status(200).json(response(200,'success get tagblog', tagblogGets));

        } catch (err) {
            res.status(500).json(response(500,'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan data tagblog berdasarkan id
    gettagblogById : async (req,res) => {
        try{
            //mendapatkan data tagblog berdasarkan id
            let tagblogGet = await Tagblog.findOne({
                where : {
                    id : req.params.id
                },
            });

            //cek jika tagblog tidak ada
            if(!tagblogGet){
                res.status(404).json(response(404,'tagblog not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200,'success get tagblog by id', tagblogGet));
        }catch (err) {
            res.status(500).json(response(500,'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate tagblog berdasarkan id
    updatetagblog : async (req, res) => {
        try {
            //mendapatkan data tagblog untuk pengecekan
            let tagblogGet = await Tagblog.findOne({
                where:{
                    id : req.params.id
                }
            })

            //cek apakah data tagblog ada
            if(!tagblogGet){
                res.status(404).json(response(404,'tagblog not found'));
                return;
            }

             //membuat schema untuk validasi
            const schema = {
                title: {
                    type: "string",
                    min: 1,
                }
            }

             //buat object tagblog
            let tagblogUpdateObj = {
                title: req.body.title,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(tagblogUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update tagblog
            await Tagblog.update(tagblogUpdateObj, {
                where:{
                    id: req.params.id,
                }
            })

            //mendapatkan data tagblog setelah update
            let tagblogAfterUpdate = await Tagblog.findOne({
                where:{
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200,'success update tagblog', tagblogAfterUpdate));
            
        } catch (err) {
            res.status(500).json(response(500,'internal server error', err));
            console.log(err);
        }   
    },

    //menghapus tagblog berdasarkan id
    deletetagblog: async (req, res) => {
        try {

            //mendapatkan data tagblog untuk pengecekan
            let tagblogGet = await Tagblog.findOne({
                where:{
                    id : req.params.id
                }
            })

            //cek apakah data tagblog ada
            if(!tagblogGet){
                res.status(404).json(response(404,'tagblog not found'));
                return;
            }

            await Tagblog.destroy({
                where:{
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200,'success delete tagblog'));

        } catch (err) {
            res.status(500).json(response(500,'internal server error', err));
            console.log(err);
        }
    }
}