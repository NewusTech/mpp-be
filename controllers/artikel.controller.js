const { response } = require('../helpers/response.formatter');

const { Artikel } = require('../models');

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

    //membuat artikel
    createartikel: async (req, res) => {
        try {

            //membuat schema untuk validasi
            const schema = {
                title: {
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
            }

            let image = null;

            if (req.file) {
                const { mimetype, buffer, originalname } = req.file;
                const base64 = Buffer.from(buffer).toString("base64");
                const dataURI = `data:${mimetype};base64,${base64}`;

                const now = new Date();
                const timestamp = now.toISOString().replace(/[-:.]/g, '');
                const uniqueFilename = `image_${timestamp}`;

                const result = await cloudinary.uploader.upload(dataURI, {
                    folder: "mpp/artikel",
                    public_id: uniqueFilename,
                });

                image = result.secure_url;
            }

            //buat object artikel
            let artikelCreateObj = {
                title: req.body.title,
                slug: req.body.title ? slugify(req.body.title, { lower: true }) : null,
                desc: req.body.desc,
                image: req.file ? image : null,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(artikelCreateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //mendapatkan data data untuk pengecekan
            let dataGets = await Artikel.findOne({
                where: {
                    slug: artikelCreateObj.slug
                }
            }
            );

            //cek apakah slug sudah terdaftar
            if (dataGets) {
                res.status(409).json(response(409, 'slug already registered'));
                return;
            }

            //buat artikel
            let artikelCreate = await Artikel.create(artikelCreateObj);

            //response menggunakan helper response.formatter
            res.status(201).json(response(201, 'success create artikel', artikelCreate));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

     //mendapatkan semua data artikel
     getartikel: async (req, res) => {
        try {
            const search = req.query.search ?? null;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            let artikelGets;
            let totalCount;

            if (search) {
                [artikelGets, totalCount] = await Promise.all([
                    Artikel.findAll({
                        where: {
                            [Op.or]: [
                                { title: { [Op.iLike]: `%${search}%` } }
                            ]
                        },
                        limit: limit,
                        offset: offset
                    }),
                    Artikel.count({
                        where: {
                            [Op.or]: [
                                { title: { [Op.iLike]: `%${search}%` } }
                            ]
                        }
                    })
                ]);
            } else {
                [artikelGets, totalCount] = await Promise.all([
                    Artikel.findAll({
                        limit: limit,
                        offset: offset
                    }),
                    Artikel.count()
                ]);
            }

            const pagination = generatePagination(totalCount, page, limit, '/api/user/artikel/get');

            res.status(200).json({
                status: 200,
                message: 'success get artikel',
                data: artikelGets,
                pagination: pagination
            });

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan data artikel berdasarkan id
    getartikelById: async (req, res) => {
        try {
            //mendapatkan data artikel berdasarkan id
            let artikelGet = await Artikel.findOne({
                where: {
                    id: req.params.id
                },
            });

            //cek jika artikel tidak ada
            if (!artikelGet) {
                res.status(404).json(response(404, 'artikel not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get artikel by id', artikelGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate artikel berdasarkan id
    updateartikel: async (req, res) => {
        try {
            //mendapatkan data artikel untuk pengecekan
            let artikelGet = await Artikel.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data artikel ada
            if (!artikelGet) {
                res.status(404).json(response(404, 'artikel not found'));
                return;
            }

            const oldImagePublicId = artikelGet.image ? artikelGet.image.split('/').pop().split('.')[0] : null;

            //membuat schema untuk validasi
            const schema = {
                title: {
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
            }

            let image = null;

            if (req.file) {
                const { mimetype, buffer, originalname } = req.file;
                const base64 = Buffer.from(buffer).toString("base64");
                const dataURI = `data:${mimetype};base64,${base64}`;

                const now = new Date();
                const timestamp = now.toISOString().replace(/[-:.]/g, '');
                const uniqueFilename = `image_${timestamp}`;

                const result = await cloudinary.uploader.upload(dataURI, {
                    folder: "mpp/artikel",
                    public_id: uniqueFilename,
                });

                image = result.secure_url;

                if (oldImagePublicId) {
                    await cloudinary.uploader.destroy(`mpp/artikel/${oldImagePublicId}`);
                }
            }

            //buat object artikel
            let artikelUpdateObj = {
                title: req.body.title,
                slug: req.body.title ? slugify(req.body.title, { lower: true }) : null,
                desc: req.body.desc,
                image: req.file ? image : null,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(artikelUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update artikel
            await Artikel.update(artikelUpdateObj, {
                where: {
                    id: req.params.id,
                }
            })

            //mendapatkan data artikel setelah update
            let artikelAfterUpdate = await Artikel.findOne({
                where: {
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update artikel', artikelAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //menghapus artikel berdasarkan id
    deleteartikel: async (req, res) => {
        try {

            //mendapatkan data artikel untuk pengecekan
            let artikelGet = await Artikel.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data artikel ada
            if (!artikelGet) {
                res.status(404).json(response(404, 'artikel not found'));
                return;
            }

            // Hapus gambar terkait jika ada
            if (artikelGet.image) {
                const oldImagePublicId = artikelGet.image ? artikelGet.image.split('/').pop().split('.')[0] : null;

                await cloudinary.uploader.destroy(`mpp/artikel/${oldImagePublicId}`);
            }

            await Artikel.destroy({
                where: {
                    id: req.params.id,
                }
            })

            res.status(200).json(response(200, 'success delete artikel'));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    }
}