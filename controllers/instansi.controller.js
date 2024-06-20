const { response } = require('../helpers/response.formatter');

const { Instansi, Layanan, sequelize } = require('../models');

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

    //membuat instansi
    createinstansi: async (req, res) => {
        try {

            //membuat schema untuk validasi
            const schema = {
                name: { type: "string", min: 3 },
                desc: { type: "string", min: 3, optional: true },
                pj: { type: "string", min: 3, optional: true },
                nip_pj: { type: "string", min: 3, optional: true },
                alamat: { type: "string", min: 3, optional: true },
                image: { type: "string", optional: true },
                active_offline: { type: "number", optional: true },
                active_online: { type: "number", optional: true },
                status: { type: "number", optional: true },
                telp: { type: "string", optional: true, min: 7, max: 15 },
                email: { type: "string", min: 5, max: 25, pattern: /^\S+@\S+\.\S+$/, optional: true },
                jam_buka: { type: "string", optional: true },
                jam_tutup: { type: "string", optional: true }
            }

            if (req.file) {
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${req.file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `dir_mpp/instansi/${uniqueFileName}`,
                    Body: req.file.buffer,
                    ACL: 'public-read',
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);

                await s3Client.send(command);

                imageKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            //buat object instansi
            let instansiCreateObj = {
                name: req.body.name,
                slug: req.body.name ? slugify(req.body.name, { lower: true }) : null,
                desc: req.body.desc,
                pj: req.body.pj,
                nip_pj: req.body.nip_pj,
                telp: req.body.telp,
                email: req.body.email,
                active_offline: req.body.active_offline ? Number(req.body.active_offline) : null,
                active_online: req.body.active_online ? Number(req.body.active_online) : null,
                status: req.body.status ? Number(req.body.status) : null,
                alamat: req.body.alamat,
                image: req.file ? imageKey : null,
                jam_buka: req.body.jam_buka,
                jam_tutup: req.body.jam_tutup
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(instansiCreateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //mendapatkan data data untuk pengecekan
            let dataGets = await Instansi.findOne({
                where: {
                    slug: instansiCreateObj.slug
                }
            }
            );

            //cek apakah slug sudah terdaftar
            if (dataGets) {
                res.status(409).json(response(409, 'slug already registered'));
                return;
            }

            //buat instansi
            let instansiCreate = await Instansi.create(instansiCreateObj);

            //response menggunakan helper response.formatter
            res.status(201).json(response(201, 'success create instansi', instansiCreate));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan semua data instansi
    getinstansi: async (req, res) => {
        try {
            const search = req.query.search ?? null;
            const active_offline = req.query.active_offline ?? null;
            const active_online = req.query.active_online ?? null;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            let instansiGets;
            let totalCount;

            const whereCondition = {};
            if (search) {
                whereCondition[Op.or] = [{ name: { [Op.iLike]: `%${search}%` } }];
            }
            if (active_offline !== null) {
                whereCondition.active_offline = active_offline === 'true';
            }
            if (active_online !== null) {
                whereCondition.active_online = active_online === 'true';
            }

            if (search || active_online !== null || active_offline !== null) {
                [instansiGets, totalCount] = await Promise.all([
                    Instansi.findAll({
                        where: whereCondition,
                        include: [{ model: Layanan, as: 'Layanans', attributes: ['id'] }],
                        limit: limit,
                        offset: offset
                    }),
                    Instansi.count({
                        where: whereCondition
                    })
                ]);
            } else {
                [instansiGets, totalCount] = await Promise.all([
                    Instansi.findAll({
                        include: [{ model: Layanan, as: 'Layanans', attributes: ['id'] }],
                        limit: limit,
                        offset: offset
                    }),
                    Instansi.count()
                ]);
            }

            const formattedInstansiGets = instansiGets.map(instansi => {
                const { id, name, slug, alamat, telp, email, desc, pj, nip_pj, image, active_online, active_offline, status, jam_buka, jam_tutup, createdAt, updatedAt } = instansi.toJSON();
                const jmlLayanan = instansi.Layanans.length;
                return {
                    id, name, slug, alamat, telp, email, desc, pj, nip_pj, image, active_online, active_offline, status, jam_buka, jam_tutup, createdAt, updatedAt, jmlLayanan
                };
            });

            const pagination = generatePagination(totalCount, page, limit, '/api/user/instansi/get');

            res.status(200).json({
                status: 200,
                message: 'success get instansi',
                data: formattedInstansiGets,
                pagination: pagination
            });

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },


    //mendapatkan data instansi berdasarkan slug
    getinstansiBySlug: async (req, res) => {
        try {
            //mendapatkan data instansi berdasarkan slug
            let instansiGet = await Instansi.findOne({
                where: {
                    slug: req.params.slug
                },
                include: [{ model: Layanan, as: 'Layanans', attributes: ['id'] }]
            });

            //cek jika instansi tidak ada
            if (!instansiGet) {
                res.status(404).json(response(404, 'instansi not found'));
                return;
            }

            const { id, name, slug, alamat, telp, email, desc, pj, nip_pj, image, active_online, active_offline, status, jam_buka, jam_tutup, createdAt, updatedAt, Layanans } = instansiGet.toJSON();
            const jmlLayanan = Layanans.length;

            const formattedInstansiGets = {
                id, name, slug, alamat, telp, email, desc, pj, nip_pj, image, active_online, active_offline, status, jam_buka, jam_tutup, createdAt, updatedAt, jmlLayanan
            };

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get instansi by slug', formattedInstansiGets));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate instansi berdasarkan slug
    updateinstansi: async (req, res) => {
        try {
            //mendapatkan data instansi untuk pengecekan
            let instansiGet = await Instansi.findOne({
                where: {
                    slug: req.params.slug
                }
            })

            //cek apakah data instansi ada
            if (!instansiGet) {
                res.status(404).json(response(404, 'instansi not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                name: { type: "string", min: 3 },
                desc: { type: "string", min: 3, optional: true },
                pj: { type: "string", min: 3, optional: true },
                nip_pj: { type: "string", min: 3, optional: true },
                alamat: { type: "string", min: 3, optional: true },
                image: { type: "string", optional: true },
                active_offline: { type: "number", optional: true },
                active_online: { type: "number", optional: true },
                status: { type: "number", optional: true },
                telp: { type: "string", optional: true, min: 7, max: 15 },
                email: { type: "string", min: 5, max: 25, pattern: /^\S+@\S+\.\S+$/, optional: true },
                jam_buka: { type: "string", optional: true },
                jam_tutup: { type: "string", optional: true }
            }

            if (req.file) {
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${req.file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `dir_mpp/instansi/${uniqueFileName}`,
                    Body: req.file.buffer,
                    ACL: 'public-read',
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);
                await s3Client.send(command);

                imageKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            //buat object instansi
            let instansiUpdateObj = {
                name: req.body.name,
                slug: slugify(req.body.name, { lower: true }),
                desc: req.body.desc,
                pj: req.body.pj,
                nip_pj: req.body.nip_pj,
                telp: req.body.telp,
                email: req.body.email,
                alamat: req.body.alamat,
                image: req.file ? imageKey : instansiGet.image,
                active_offline: req.body.active_offline ? Number(req.body.active_offline) : undefined,
                active_online: req.body.active_online ? Number(req.body.active_online) : undefined,
                status: req.body.status ? Number(req.body.status) : undefined,
                jam_buka: req.body.jam_buka,
                jam_tutup: req.body.jam_tutup
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(instansiUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update instansi
            await Instansi.update(instansiUpdateObj, {
                where: {
                    slug: req.params.slug,
                }
            })

            //mendapatkan data instansi setelah update
            let instansiAfterUpdate = await Instansi.findOne({
                where: {
                    slug: req.params.slug,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update instansi', instansiAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //menghapus instansi berdasarkan slug
    deleteinstansi: async (req, res) => {
        try {

            //mendapatkan data instansi untuk pengecekan
            let instansiGet = await Instansi.findOne({
                where: {
                    slug: req.params.slug
                }
            })

            //cek apakah data instansi ada
            if (!instansiGet) {
                res.status(404).json(response(404, 'instansi not found'));
                return;
            }

            await Instansi.destroy({
                where: {
                    slug: req.params.slug,
                }
            })

            res.status(200).json(response(200, 'success delete instansi'));

        } catch (err) {
            if (err.name === 'SequelizeForeignKeyConstraintError') {
                res.status(400).json(response(400, 'Data tidak bisa dihapus karena masih digunakan pada tabel lain'));
            } else {
                res.status(500).json(response(500, 'Internal server error', err));
                console.log(err);
            }
        }
    }
}