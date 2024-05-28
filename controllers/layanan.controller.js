const { response } = require('../helpers/response.formatter');

const { Layanan } = require('../models');
require('dotenv').config()

const slugify = require('slugify');
const Validator = require("fastest-validator");
const v = new Validator();
const { generatePagination } = require('../pagination/pagination');
const { Op } = require('sequelize');
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

module.exports = {

    //membuat layanan
    createlayanan: async (req, res) => {
        try {

            //membuat schema untuk validasi
            const schema = {
                name: {
                    type: "string",
                    min: 3,
                },
                desc: {
                    type: "string",
                    min: 3,
                    optional: true
                },
                image: {
                    type: "string",
                    optional: true
                },
                status: {
                    type: "number",
                    optional: true
                },
                instansi_id: {
                    type: "number",
                    optional: true
                },
            }

            let image = null;
            
            if(req.file){
                const { mimetype, buffer, originalname } = req.file;
                const base64 = Buffer.from(buffer).toString("base64");
                const dataURI = `data:${mimetype};base64,${base64}`;

                const now = new Date();
                const timestamp = now.toISOString().replace(/[-:.]/g, ''); 
                const uniqueFilename = `image_${timestamp}`;

                const result = await cloudinary.uploader.upload(dataURI, {
                    folder: "mpp/layanan",
                    public_id: uniqueFilename,
                });

                image = result.secure_url;
            }

            //buat object layanan
            let layananCreateObj = {
                name: req.body.name,
                slug: slugify(req.body.name, { lower: true }),
                desc: req.body.desc,
                image: req.file ? image : null,
                status: Number(req.body.status),
                instansi_id: req.body.instansi_id !== undefined ? Number(req.body.instansi_id) : null,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(layananCreateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //mendapatkan data data untuk pengecekan
            let dataGets = await Layanan.findOne({
                where: {
                    slug: layananCreateObj.slug
                }
            }
            );

            //cek apakah slug sudah terdaftar
            if (dataGets) {
                res.status(409).json(response(409, 'slug already registered'));
                return;
            }

            //buat layanan
            let layananCreate = await Layanan.create(layananCreateObj);

            //response menggunakan helper response.formatter
            res.status(201).json(response(201, 'success create layanan', layananCreate));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan semua data layanan
    getlayanan: async (req, res) => {
        try {
          
            const search = req.query.search ?? null;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            let layananGets;
            let totalCount;

            if (search) {
                [layananGets, totalCount] = await Promise.all([
                    Layanan.findAll({
                        where: {
                            [Op.or]: [
                                { name: { [Op.iLike]: `%${search}%` } }
                            ]
                        },
                        limit: limit,
                        offset: offset
                    }),
                    Layanan.count({
                        where: {
                            [Op.or]: [
                                { name: { [Op.iLike]: `%${search}%` } }
                            ]
                        }
                    })
                ]);
            } else {
                [layananGets, totalCount] = await Promise.all([
                    Layanan.findAll({
                        limit: limit,
                        offset: offset
                    }),
                    Layanan.count()
                ]);
            }

            const pagination = generatePagination(totalCount, page, limit, '/api/user/layanan/get');

            res.status(200).json({
                status: 200,
                message: 'success get instansi',
                data: layananGets,
                pagination: pagination
            });

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan data layanan berdasarkan id
    getlayananById: async (req, res) => {
        try {
            //mendapatkan data layanan berdasarkan id
            let layananGet = await Layanan.findOne({
                where: {
                    id: req.params.id
                },
            });

            //cek jika layanan tidak ada
            if (!layananGet) {
                res.status(404).json(response(404, 'layanan not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get layanan by id', layananGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate layanan berdasarkan id
    updatelayanan: async (req, res) => {
        try {
            //mendapatkan data layanan untuk pengecekan
            let layananGet = await Layanan.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data layanan ada
            if (!layananGet) {
                res.status(404).json(response(404, 'layanan not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                name: {
                    type: "string",
                    min: 3,
                },
                desc: {
                    type: "string",
                    min: 3,
                    optional: true
                },
                image: {
                    type: "string",
                    optional: true
                },
                status: {
                    type: "number",
                    optional: true
                }
            }

            const oldImagePublicId = layananGet.image ? layananGet.image.split('/').pop().split('.')[0] : null;

            let image = null;
            
            if(req.file){
                const { mimetype, buffer, originalname } = req.file;
                const base64 = Buffer.from(buffer).toString("base64");
                const dataURI = `data:${mimetype};base64,${base64}`;

                const now = new Date();
                const timestamp = now.toISOString().replace(/[-:.]/g, ''); 
                const uniqueFilename = `image_${timestamp}`;

                const result = await cloudinary.uploader.upload(dataURI, {
                    folder: "mpp/layanan",
                    public_id: uniqueFilename,
                });

                image = result.secure_url;

                if (oldImagePublicId) {
                    await cloudinary.uploader.destroy(`mpp/layanan/${oldImagePublicId}`);
                }
            }

            //buat object layanan
            let layananUpdateObj = {
                name: req.body.name,
                slug: slugify(req.body.name, { lower: true }),
                desc: req.body.desc,
                image: req.file ? image : null,
                status: Number(req.body.status),
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(layananUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update layanan
            await Layanan.update(layananUpdateObj, {
                where: {
                    id: req.params.id,
                }
            })

            //mendapatkan data layanan setelah update
            let layananAfterUpdate = await Layanan.findOne({
                where: {
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update layanan', layananAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //menghapus layanan berdasarkan id
    deletelayanan: async (req, res) => {
        try {

            //mendapatkan data layanan untuk pengecekan
            let layananGet = await Layanan.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data layanan ada
            if (!layananGet) {
                res.status(404).json(response(404, 'layanan not found'));
                return;
            }

            // Hapus gambar terkait jika ada
            if (layananGet.image) {
                const oldImagePublicId = layananGet.image ? layananGet.image.split('/').pop().split('.')[0] : null;

                await cloudinary.uploader.destroy(`mpp/layanan/${oldImagePublicId}`);
            }

            await Layanan.destroy({
                where: {
                    id: req.params.id,
                }
            })

            res.status(200).json(response(200, 'success delete layanan'));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },
    
}