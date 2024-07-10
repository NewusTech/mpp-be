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
    },
    useAccelerateEndpoint: true
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
                email: { type: "string", min: 5, max: 50, pattern: /^\S+@\S+\.\S+$/, optional: true },
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
                slug: req.body.name ? slugify(req.body.name, { lower: true }) : undefined,
                desc: req.body.desc,
                pj: req.body.pj,
                nip_pj: req.body.nip_pj,
                telp: req.body.telp,
                email: req.body.email,
                active_offline: req.body.active_offline ? Number(req.body.active_offline) : 0,
                active_online: req.body.active_online ? Number(req.body.active_online) : 0,
                status: req.body.status ? Number(req.body.status) : 0,
                alamat: req.body.alamat,
                image: req.file ? imageKey : undefined,
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
            const showDeleted = req.query.showDeleted ?? null;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            let instansiGets;
            let totalCount;

            const whereCondition = {};

            if (search) {
                whereCondition[Op.or] = [{ name: { [Op.iLike]: `%${search}%` } }];
            }

            if (data?.role === "Admin Instansi" || data?.role === "Super Admin" || data?.role === "Bupati" || data?.role === "Staff Instansi") {
            } else {
                whereCondition.status = true;
            }

            if (showDeleted !== null) {
                whereCondition.deletedAt = { [Op.not]: null };
            } else {
                whereCondition.deletedAt = null;
            }

            [instansiGets, totalCount] = await Promise.all([
                Instansi.findAll({
                    where: whereCondition,
                    include: [{ model: Layanan, as: 'Layanans', attributes: ['id'] }],
                    limit: limit,
                    order: [
                        ['status', 'DESC'],
                        ['id', 'ASC']
                    ]
                }),
                Instansi.count({
                    where: whereCondition
                })
            ]);

            const formattedInstansiGets = instansiGets.map(instansi => {
                const { id, name, slug, alamat, telp, email, desc, pj, nip_pj, image, active_online, active_offline, status, jam_buka, jam_tutup, createdAt, updatedAt, deletedAt } = instansi.toJSON();
                const jmlLayanan = instansi.Layanans.length;
                return {
                    id, name, slug, alamat, telp, email, desc, pj, nip_pj, image, active_online, active_offline, status, jam_buka, jam_tutup, createdAt, updatedAt, deletedAt, jmlLayanan
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
            const showDeleted = req.query.showDeleted ?? null;
            const whereCondition = { slug: req.params.slug };

            if (showDeleted !== null) {
                whereCondition.deletedAt = { [Op.not]: null };
            } else {
                whereCondition.deletedAt = null;
            }

            if (data?.role === "Admin Instansi" || data?.role === "Super Admin" || data?.role === "Bupati" || data?.role === "Staff Instansi") {
            } else {
                whereCondition.status = true;
            }

            let instansiGet = await Instansi.findOne({
                where: whereCondition,
                include: [{ model: Layanan, as: 'Layanans', attributes: ['id', 'name', 'desc', 'syarat', 'dasarhukum'] }]
            });

            //cek jika instansi tidak ada
            if (!instansiGet) {
                res.status(404).json(response(404, 'instansi not found'));
                return;
            }

            const { id, name, slug, alamat, telp, email, desc, pj, nip_pj, image, active_online, active_offline, status, jam_buka, jam_tutup, createdAt, updatedAt, deletedAt, Layanans } = instansiGet.toJSON();
            const jmlLayanan = Layanans.length;

            const formattedInstansiGets = {
                id, name, slug, alamat, telp, email, desc, pj, nip_pj, image, active_online, active_offline, status, jam_buka, jam_tutup, createdAt, updatedAt, deletedAt, jmlLayanan,
                Layanans // Include the services
            };

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
                    slug: req.params.slug,
                    deletedAt: null
                }
            })

            //cek apakah data instansi ada
            if (!instansiGet) {
                res.status(404).json(response(404, 'instansi not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                name: { type: "string", min: 3, optional: true },
                desc: { type: "string", optional: true },
                pj: { type: "string", optional: true },
                nip_pj: { type: "string", optional: true },
                alamat: { type: "string", optional: true },
                image: { type: "string", optional: true },
                active_offline: { type: "number", optional: true },
                active_online: { type: "number", optional: true },
                status: { type: "number", optional: true },
                telp: { type: "string", optional: true, min: 7, max: 15 },
                email: { type: "string", min: 5, max: 50, pattern: /^\S+@\S+\.\S+$/, optional: true },
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
                slug: req.body.name ? slugify(req.body.name, { lower: true }) : undefined,
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

    deleteinstansi: async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            // Cari instansi yang belum dihapus (deletedAt === null)
            let instansiGet = await Instansi.findOne({
                where: {
                    slug: req.params.slug,
                    deletedAt: null
                },
                transaction
            });

            // Jika instansi tidak ditemukan, kirim respons 404
            if (!instansiGet) {
                await transaction.rollback();
                res.status(404).json(response(404, 'instansi not found'));
                return;
            }

            // Ambil semua model terkait dengan Instansi
            const models = Object.keys(sequelize.models);

            // Array untuk menyimpan promise update untuk setiap model terkait
            const updatePromises = [];

            // Lakukan soft delete pada semua model terkait
            models.forEach(async modelName => {
                const Model = sequelize.models[modelName];
                if (Model.associations && Model.associations.Instansi && Model.rawAttributes.deletedAt) {
                    updatePromises.push(
                        Model.update({ deletedAt: new Date() }, {
                            where: {
                                instansi_id: instansiGet.id
                            },
                            transaction
                        })
                    );
                }
            });

            // Jalankan semua promise update secara bersamaan
            await Promise.all(updatePromises);

            await Instansi.update({ deletedAt: new Date() }, {
                where: {
                    slug: req.params.slug
                },
                transaction
            });

            // Commit transaksi jika semua operasi berhasil
            await transaction.commit();

            res.status(200).json(response(200, 'success delete instansi'));

        } catch (err) {
            // Rollback transaksi jika terjadi kesalahan
            await transaction.rollback();
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    }
}