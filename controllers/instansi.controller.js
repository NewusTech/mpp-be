const { response } = require('../helpers/response.formatter');

const { Instansi } = require('../models');

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
                telp: { type: "string", optional: true, min: 7, max: 15 }
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
                    folder: "mpp/instansi",
                    public_id: uniqueFilename,
                });

                image = result.secure_url;
            }

            //buat object instansi
            let instansiCreateObj = {
                name: req.body.name,
                slug: req.body.name ? slugify(req.body.name, { lower: true }) : null,
                desc: req.body.desc,
                pj: req.body.pj,
                nip_pj: req.body.nip_pj,
                telp: req.body.telp,
                active_offline: req.body.active_offline ? Number(req.body.active_offline) : null,
                active_online: req.body.active_online ? Number(req.body.active_online) : null,
                status: req.body.status ? Number(req.body.status) : null,
                alamat: req.body.alamat,
                image: req.file ? image : null
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
            console.log(data)
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
                        limit: limit,
                        offset: offset
                    }),
                    Instansi.count()
                ]);
            }
    
            const pagination = generatePagination(totalCount, page, limit, '/api/user/instansi/get');
    
            res.status(200).json({
                status: 200,
                message: 'success get instansi',
                data: instansiGets,
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
            });

            //cek jika instansi tidak ada
            if (!instansiGet) {
                res.status(404).json(response(404, 'instansi not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get instansi by slug', instansiGet));
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

            const oldImagePublicId = instansiGet.image ? instansiGet.image.split('/').pop().split('.')[0] : null;

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
                telp: { type: "string", optional: true, min: 7, max: 15 }
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
                    folder: "mpp/instansi",
                    public_id: uniqueFilename,
                });

                image = result.secure_url;

                if (oldImagePublicId) {
                    await cloudinary.uploader.destroy(`mpp/instansi/${oldImagePublicId}`);
                }
            }

            //buat object instansi
            let instansiUpdateObj = {
                name: req.body.name,
                slug: slugify(req.body.name, { lower: true }),
                desc: req.body.desc,
                pj: req.body.pj,
                nip_pj: req.body.nip_pj,
                telp: req.body.telp,
                alamat: req.body.alamat,
                image: req.file ? image : null,
                active_offline: req.body.active_offline ? Number(req.body.active_offline) : null,
                active_online: req.body.active_online ? Number(req.body.active_online) : null,
                status: req.body.status ? Number(req.body.status) : null,
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

            // Hapus gambar terkait jika ada
            if (instansiGet.image) {
                const oldImagePublicId = instansiGet.image ? instansiGet.image.split('/').pop().split('.')[0] : null;

                await cloudinary.uploader.destroy(`mpp/instansi/${oldImagePublicId}`);
            }

            await Instansi.destroy({
                where: {
                    slug: req.params.slug,
                }
            })

            res.status(200).json(response(200, 'success delete instansi'));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    }
}