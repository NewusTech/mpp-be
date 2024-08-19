const { response } = require('../helpers/response.formatter');

const { Apkinstansi, Instansi } = require('../models');
require('dotenv').config()

const Validator = require("fastest-validator");
const v = new Validator();
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

    //input form user
    input: async (req, res) => {
        try {

            //membuat schema untuk validasi
            const schema = {
                name: { type: "string" },
                instansi_id: { type: "number" },
                desc: { type: "string", optional: true },
                link: { type: "string", optional: true },
            }

            if (req.file) {
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${req.file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `${process.env.PATH_AWS}/apkinstansi/${uniqueFileName}`,
                    Body: req.file.buffer,
                    ACL: 'public-read',
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);

                await s3Client.send(command);

                fileKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            //buat object layanan
            let layananCreateObj = {
                name: req.body.name,
                link: req.body.link,
                desc: req.body.desc,
                instansi_id: Number(req.params.id),
                file: req.file ? fileKey : undefined,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(layananCreateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //buat layanan
            let layananCreate = await Apkinstansi.create(layananCreateObj);

            //response menggunakan helper response.formatter
            res.status(201).json(response(201, 'success create', layananCreate));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    get: async (req, res) => {
        try {
            const id = req.params.id;

            let layananData = await Instansi.findOne({
                where: {
                    id: id
                },
                attributes: ['id' ,'name', 'desc', 'image'],
                include: [
                    {
                        model: Apkinstansi,
                    },
                ]
            });

            if (!layananData) {
                res.status(404).json(response(404, 'data not found'));
                return;
            }

            res.status(200).json(response(200, 'success get data', layananData));
        } catch (err) {
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

    getbyid: async (req, res) => {
        try {
        
            let ApkinstansiGet = await Apkinstansi.findOne({
                where: {
                    id: req.params.id
                },
            });

            //cek jika Apkinstansi tidak ada
            if (!ApkinstansiGet) {
                res.status(404).json(response(404, 'Apkinstansi not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get Apkinstansi by slug', ApkinstansiGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    update: async (req, res) => {
        try {
            //mendapatkan data layanan untuk pengecekan
            let layananGet = await Apkinstansi.findOne({
                where: {
                    id: req.params.id,
                }
            })

            //cek apakah data layanan ada
            if (!layananGet) {
                res.status(404).json(response(404, 'layanan not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                name: { type: "string", optional: true },
                desc: { type: "string", optional: true },
                link: { type: "string", optional: true },
            }

            if (req.file) {
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${req.file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `${process.env.PATH_AWS}/layanan/${uniqueFileName}`,
                    Body: req.file.buffer,
                    ACL: 'public-read',
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);

                await s3Client.send(command);

                fileKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            //buat object layanan
            let layananUpdateObj = {
                name: req.body.name,
                link: req.body.link,
                desc: req.body.desc,
                file: req.file ? fileKey : layananGet.file,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(layananUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update layanan
            await Apkinstansi.update(layananUpdateObj, {
                where: {
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update'));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    delete: async (req, res) => {
        try {

            //mendapatkan data Apkinstansi untuk pengecekan
            let ApkinstansiGet = await Apkinstansi.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data Apkinstansi ada
            if (!ApkinstansiGet) {
                res.status(404).json(response(404, 'Apkinstansi not found'));
                return;
            }

            await Apkinstansi.destroy({
                where: {
                    id: req.params.id,
                }
            })

            res.status(200).json(response(200, 'success delete Apkinstansi'));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    }

}