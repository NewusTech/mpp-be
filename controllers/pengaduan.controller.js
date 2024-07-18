const { response } = require('../helpers/response.formatter');

const { Pengaduan, Layanan, Instansi, Userinfo } = require('../models');
const Validator = require("fastest-validator");
const v = new Validator();
const { generatePagination } = require('../pagination/pagination');
const { Op } = require('sequelize');
const moment = require('moment-timezone');

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

    //membuat pengaduan
    createpengaduan: async (req, res) => {
        try {

            //membuat schema untuk validasi
            const schema = {
                judul: { type: "string", min: 3 },
                instansi_id: { type: "number" },
                layanan_id: { type: "number" },
                status: { type: "number" },
                aduan: { type: "string", min: 3, optional: true },
                jawaban: { type: "string", optional: true },
                image: {
                    type: "string",
                    optional: true
                },
            }

            const userinfo_id = data.role === "User" ? data.userId : null;

            if (req.file) {
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${req.file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `${process.env.PATH_AWS}/pengaduan/${uniqueFileName}`,
                    Body: req.file.buffer,
                    ACL: 'public-read',
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);

                await s3Client.send(command);

                imageKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            //buat object pengaduan
            let pengaduanCreateObj = {
                judul: req.body.judul,
                aduan: req.body.aduan,
                instansi_id: Number(req.body.instansi_id),
                layanan_id: Number(req.body.layanan_id),
                status: Number(req.body.status),
                jawaban: req.body.jawaban,
                userinfo_id: userinfo_id ?? null,
                image: req.file ? imageKey : undefined,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(pengaduanCreateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //buat pengaduan
            let pengaduanCreate = await Pengaduan.create(pengaduanCreateObj);

            //response menggunakan helper response.formatter
            res.status(201).json(response(201, 'success create pengaduan', pengaduanCreate));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan semua data pengaduan
    getpengaduan: async (req, res) => {
        try {
            const userinfo_id = data.role === "User" ? data.userId : null;

            const instansi_id = req.query.instansi_id ?? null;
            const search = req.query.search ?? null;
            const start_date = req.query.start_date;
            const end_date = req.query.end_date;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            let pengaduanGets;
            let totalCount;

            const whereCondition = {};

            if (instansi_id) {
                whereCondition.instansi_id = instansi_id;
            }
            if (search) {
                whereCondition[Op.or] = [{ judul: { [Op.iLike]: `%${search}%` } }];
            }
            if (userinfo_id) {
                whereCondition.userinfo_id = userinfo_id;
            }
            if (start_date && end_date) {
                whereCondition.createdAt = {
                    [Op.between]: [moment(start_date).startOf('day').toDate(), moment(end_date).endOf('day').toDate()]
                };
            } else if (start_date) {
                whereCondition.createdAt = {
                    [Op.gte]: moment(start_date).startOf('day').toDate()
                };
            } else if (end_date) {
                whereCondition.createdAt = {
                    [Op.lte]: moment(end_date).endOf('day').toDate()
                };
            }

            [pengaduanGets, totalCount] = await Promise.all([
                Pengaduan.findAll({
                    where: whereCondition,
                    include: [
                        { model: Layanan, attributes: ['id', 'name'] },
                        { model: Instansi, attributes: ['id', 'name'] },
                        { model: Userinfo, attributes: ['id', 'name', 'nik'] }
                    ],
                    limit: limit,
                    offset: offset,
                    order: [['id', 'DESC']]
                }),
                Pengaduan.count({
                    where: {
                        [Op.or]: [
                            { judul: { [Op.iLike]: `%${search}%` } }
                        ]
                    }
                })
            ]);

            const pagination = generatePagination(totalCount, page, limit, '/api/user/pengaduan/get');

            res.status(200).json({
                status: 200,
                message: 'success get pengaduan',
                data: pengaduanGets,
                pagination: pagination
            });

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan data pengaduan berdasarkan id
    getpengaduanById: async (req, res) => {
        try {
            //mendapatkan data pengaduan berdasarkan id
            let pengaduanGet = await Pengaduan.findOne({
                where: {
                    id: req.params.id
                },
                include: [
                    { model: Layanan, attributes: ['id', 'name'] },
                    { model: Instansi, attributes: ['id', 'name'] },
                    { model: Userinfo, attributes: ['id', 'name', 'nik'] }
                ],
            });

            //cek jika pengaduan tidak ada
            if (!pengaduanGet) {
                res.status(404).json(response(404, 'pengaduan not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get pengaduan by id', pengaduanGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate pengaduan berdasarkan id
    updatepengaduan: async (req, res) => {
        try {
            //mendapatkan data pengaduan untuk pengecekan
            let pengaduanGet = await Pengaduan.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data pengaduan ada
            if (!pengaduanGet) {
                res.status(404).json(response(404, 'pengaduan not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                status: { type: "number", optional: true },
                jawaban: { type: "string", optional: true }
            }

            //buat object pengaduan
            let pengaduanUpdateObj = {
                status: Number(req.body.status),
                jawaban: req.body.jawaban,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(pengaduanUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update pengaduan
            await Pengaduan.update(pengaduanUpdateObj, {
                where: {
                    id: req.params.id,
                }
            })

            //mendapatkan data pengaduan setelah update
            let pengaduanAfterUpdate = await Pengaduan.findOne({
                where: {
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update pengaduan', pengaduanAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //menghapus pengaduan berdasarkan id
    deletepengaduan: async (req, res) => {
        try {

            //mendapatkan data pengaduan untuk pengecekan
            let pengaduanGet = await Pengaduan.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data pengaduan ada
            if (!pengaduanGet) {
                res.status(404).json(response(404, 'pengaduan not found'));
                return;
            }

            await Pengaduan.destroy({
                where: {
                    id: req.params.id,
                }
            })

            res.status(200).json(response(200, 'success delete pengaduan'));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    }
}