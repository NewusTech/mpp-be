const { response } = require('../helpers/response.formatter');

const { Artikel, Instansi } = require('../models');
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
                title: { type: "string", min: 3 },
                desc: { type: "string", min: 3, optional: true },
                image: { type: "string", optional: true },
                instansi_id: { type: "number", optional: true }
            }

            if (req.file) {
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${req.file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `dir_mpp/artikel/${uniqueFileName}`,
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
                instansi_id: req.body.instansi_id !== undefined ? Number(req.body.instansi_id) : undefined,
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
            const instansi_id = req.query.instansi_id ?? null;
            const search = req.query.search ?? null;
            const showDeleted = req.query.showDeleted ?? null;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            let artikelGets;
            let totalCount;
    
            const whereCondition = {};

            if (showDeleted !== null) {
                whereCondition.deletedAt = { [Op.not]: null };
            } else {
                whereCondition.deletedAt = null;
            }

            if (instansi_id) {
                whereCondition.instansi_id = instansi_id;
            }
    
            if (search) {
                whereCondition[Op.or] = [{ title: { [Op.iLike]: `%${search}%` } }];
            }
    
            [artikelGets, totalCount] = await Promise.all([
                Artikel.findAll({
                    where: whereCondition,
                    include: [{ model: Instansi, attributes: ['id', 'name', 'desc', 'image'] }],
                    limit: limit,
                    offset: offset
                }),
                Artikel.count({
                    where: whereCondition
                })
            ]);
    
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
            const showDeleted = req.query.showDeleted ?? null;
            const whereCondition = { slug: req.params.slug };

            if (showDeleted !== null) {
                whereCondition.deletedAt = { [Op.not]: null };
            } else {
                whereCondition.deletedAt = null;
            }

            //mendapatkan data artikel berdasarkan slug
            let artikelGet = await Artikel.findOne({
                where: whereCondition,
                include: [{ model: Instansi, attributes: ['id', 'name', 'desc', 'image'] }],
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
                    slug: req.params.slug,
                    deletedAt: null
                }
            })

            //cek apakah data artikel ada
            if (!artikelGet) {
                res.status(404).json(response(404, 'artikel not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                title: { type: "string", min: 3, optional: true },
                desc: { type: "string", min: 3, optional: true },
                image: { type: "string", optional: true },
            }

            if (req.file) {
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${req.file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `dir_mpp/artikel/${uniqueFileName}`,
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
                    slug: req.params.slug,
                    deletedAt: null
                }
            })

            //cek apakah data artikel ada
            if (!artikelGet) {
                res.status(404).json(response(404, 'artikel not found'));
                return;
            }

            await Artikel.update({ deletedAt: new Date() }, {
                where: {
                    slug: req.params.slug
                }
            });

            res.status(200).json(response(200, 'success delete artikel'));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    }
}