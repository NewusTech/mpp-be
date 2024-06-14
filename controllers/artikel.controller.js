const { response } = require('../helpers/response.formatter');

const { Artikel } = require('../models');
const slugify = require('slugify');
const Validator = require("fastest-validator");
const v = new Validator();
const { generatePagination } = require('../pagination/pagination');
const { Op } = require('sequelize');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
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

            if (req.file) {
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${req.file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `mpp/artikel/${uniqueFileName}`,
                    Body: req.file.buffer,
                    ACL: 'public-read',
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);

                await s3Client.send(command);

                imageKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            //buat object artikel
            let artikelCreateObj = {
                title: req.body.title,
                slug: req.body.title ? slugify(req.body.title, { lower: true }) : null,
                desc: req.body.desc,
                image: req.file ? imageKey : null,
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
            });

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

    //mendapatkan data artikel berdasarkan slug
    getartikelBySlug: async (req, res) => {
        try {
            //mendapatkan data artikel berdasarkan slug
            let artikelGet = await Artikel.findOne({
                where: {
                    slug: req.params.slug
                },
            });

            //cek jika artikel tidak ada
            if (!artikelGet) {
                res.status(404).json(response(404, 'artikel not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get artikel by slug', artikelGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate artikel berdasarkan slug
    updateartikel: async (req, res) => {
        try {
            //mendapatkan data artikel untuk pengecekan
            let artikelGet = await Artikel.findOne({
                where: {
                    slug: req.params.slug
                }
            })

            //cek apakah data artikel ada
            if (!artikelGet) {
                res.status(404).json(response(404, 'artikel not found'));
                return;
            }

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

            if (req.file) {
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${req.file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `mpp/artikel/${uniqueFileName}`,
                    Body: req.file.buffer,
                    ACL: 'public-read',
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);

                await s3Client.send(command);

                imageKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            //buat object artikel
            let artikelUpdateObj = {
                title: req.body.title,
                slug: req.body.title ? slugify(req.body.title, { lower: true }) : null,
                desc: req.body.desc,
                image: req.file ? imageKey : artikelGet.image,
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
                    slug: req.params.slug,
                }
            })

            //mendapatkan data artikel setelah update
            let artikelAfterUpdate = await Artikel.findOne({
                where: {
                    slug: req.params.slug,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update artikel', artikelAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //menghapus artikel berdasarkan slug
    deleteartikel: async (req, res) => {
        try {

            //mendapatkan data artikel untuk pengecekan
            let artikelGet = await Artikel.findOne({
                where: {
                    slug: req.params.slug
                }
            })

            //cek apakah data artikel ada
            if (!artikelGet) {
                res.status(404).json(response(404, 'artikel not found'));
                return;
            }

            await Artikel.destroy({
                where: {
                    slug: req.params.slug,
                }
            })

            res.status(200).json(response(200, 'success delete artikel'));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    }
}