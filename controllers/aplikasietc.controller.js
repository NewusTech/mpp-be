const { response } = require('../helpers/response.formatter');
const { Aplikasietcs } = require('../models');
const Validator = require("fastest-validator");
const v = new Validator();
const { generatePagination } = require('../pagination/pagination');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const slugify = require('slugify');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    useAccelerateEndpoint: true
});

module.exports = {

    //membuat Aplikasietcs
    createAplikasietcs: async (req, res) => {
        try {

            //membuat schema untuk validasi
            const schema = {
                name: { type: "string", min: 3 },
                image: {
                    type: "string",
                    optional: true
                },
                desc: { type: "string", optional: true },
                link: { type: "string", optional: true },
            }

            if (req.file) {
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${req.file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `${process.env.PATH_AWS}/aplikasietc/${uniqueFileName}`,
                    Body: req.file.buffer,
                    ACL: 'public-read',
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);

                await s3Client.send(command);

                imageKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            //buat object Aplikasietcs
            let AplikasietcsCreateObj = {
                name: req.body.name,
                link: req.body.link,
                desc: req.body.desc,
                slug: req.body.name ? slugify(req.body.name, { lower: true }) : undefined,
                image: req.file ? imageKey : undefined,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(AplikasietcsCreateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //buat Aplikasietcs
            let AplikasietcsCreate = await Aplikasietcs.create(AplikasietcsCreateObj);

            //response menggunakan helper response.formatter
            res.status(201).json(response(201, 'success create Aplikasietcs', AplikasietcsCreate));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan semua data Aplikasietcs
    getAplikasietcs: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            let AplikasietcsGets;
            let totalCount;

            [AplikasietcsGets, totalCount] = await Promise.all([
                Aplikasietcs.findAll({
                    limit: limit,
                    offset: offset,
                    order: [['id', 'ASC']]
                }),
                Aplikasietcs.count()
            ]);

            const pagination = generatePagination(totalCount, page, limit, '/api/user/aplikasietc/get');

            res.status(200).json({
                status: 200,
                message: 'success get Aplikasietcs',
                data: AplikasietcsGets,
                pagination: pagination
            });

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan data Aplikasietcs berdasarkan slug
    getAplikasietcsBySlug: async (req, res) => {
        try {
            //mendapatkan data Aplikasietcs berdasarkan slug
            let AplikasietcsGet = await Aplikasietcs.findOne({
                where: {
                    slug: req.params.slug
                },
            });

            //cek jika Aplikasietcs tidak ada
            if (!AplikasietcsGet) {
                res.status(404).json(response(404, 'Aplikasietcs not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get Aplikasietcs by slug', AplikasietcsGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate Aplikasietcs berdasarkan slug
    updateAplikasietcs: async (req, res) => {
        try {
            //mendapatkan data Aplikasietcs untuk pengecekan
            let AplikasietcsGet = await Aplikasietcs.findOne({
                where: {
                    slug: req.params.slug
                }
            })

            //cek apakah data Aplikasietcs ada
            if (!AplikasietcsGet) {
                res.status(404).json(response(404, 'Aplikasietcs not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                name: { type: "string", min: 3, optional: true },
                image: { type: "string", optional: true },
            }

            if (req.file) {
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${req.file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `${process.env.PATH_AWS}/aplikasietc/${uniqueFileName}`,
                    Body: req.file.buffer,
                    ACL: 'public-read',
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);
                await s3Client.send(command);
                
                imageKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            //buat object Aplikasietcs
            let AplikasietcsUpdateObj = {
                name: req.body.name,
                link: req.body.link,
                desc: req.body.desc,
                slug: req.body.name ? slugify(req.body.name, { lower: true }) : undefined,
                image: req.file ? imageKey : AplikasietcsGet.image,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(AplikasietcsUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update Aplikasietcs
            await Aplikasietcs.update(AplikasietcsUpdateObj, {
                where: {
                    slug: req.params.slug,
                }
            })

            //mendapatkan data Aplikasietcs setelah update
            let AplikasietcsAfterUpdate = await Aplikasietcs.findOne({
                where: {
                    slug: req.params.slug,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update Aplikasietcs', AplikasietcsAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //menghapus Aplikasietcs berdasarkan slug
    deleteAplikasietcs: async (req, res) => {
        try {

            //mendapatkan data Aplikasietcs untuk pengecekan
            let AplikasietcsGet = await Aplikasietcs.findOne({
                where: {
                    slug: req.params.slug
                }
            })

            //cek apakah data Aplikasietcs ada
            if (!AplikasietcsGet) {
                res.status(404).json(response(404, 'Aplikasietcs not found'));
                return;
            }

            await Aplikasietcs.destroy({
                where: {
                    slug: req.params.slug,
                }
            })

            res.status(200).json(response(200, 'success delete Aplikasietcs'));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    }
}