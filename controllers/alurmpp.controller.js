const { response } = require('../helpers/response.formatter');

const { Alurmpp } = require('../models');

const Validator = require("fastest-validator");
const v = new Validator();
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

    //mendapatkan data alurmpp berdasarkan id
    getalurmpp: async (req, res) => {
        try {
            //mendapatkan data alurmpp berdasarkan id
            let alurmppGet = await Alurmpp.findAll({
                order: [['id', 'ASC']]
            });

            //cek jika alurmpp tidak ada
            if (!alurmppGet) {
                res.status(404).json(response(404, 'alurmpp not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get alurmpp by id', alurmppGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan data Alurmpp berdasarkan id
    getAlurmppById: async (req, res) => {
        try {
            //mendapatkan data Alurmpp berdasarkan id
            let AlurmppGet = await Alurmpp.findOne({
                where: {
                    id: req.params.id
                },
            });

            //cek jika Alurmpp tidak ada
            if (!AlurmppGet) {
                res.status(404).json(response(404, 'Alurmpp not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get Alurmpp by id', AlurmppGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate alurmpp berdasarkan id
    updatealurmpp: async (req, res) => {
        try {
            //mendapatkan data alurmpp untuk pengecekan
            let alurmppGet = await Alurmpp.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data alurmpp ada
            if (!alurmppGet) {
                res.status(404).json(response(404, 'alurmpp not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                image: { type: "string", optional: true },
                title: { type: "string", optional: true }
            }

            if (req.file) {
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${req.file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `dir_mpp/alurmpp/${uniqueFileName}`,
                    Body: req.file.buffer,
                    ACL: 'public-read',
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);

                await s3Client.send(command);

                imageKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            //buat object alurmpp
            let alurmppUpdateObj = {
                image: req.file ? imageKey : undefined,
                title: req.body.title,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(alurmppUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            await Alurmpp.update(alurmppUpdateObj, {
                where: {
                    id: req.params.id,
                }
            });

            //mendapatkan data alurmpp setelah update
            let alurmppAfterUpdate = await Alurmpp.findOne({
                where: {
                    id: alurmppGet.id,
                },
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update alurmpp', alurmppAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

}