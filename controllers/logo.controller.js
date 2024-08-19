const { response } = require('../helpers/response.formatter');

const { Logo, Role } = require('../models');

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

    get: async (req, res) => {
        try {
            //mendapatkan data logo berdasarkan id
            let logoGet = await Logo.findOne({
            });

            //cek jika logo tidak ada
            if (!logoGet) {
                res.status(404).json(response(404, 'logo not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get', logoGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate logo berdasarkan id
    updatelogo: async (req, res) => {
        try {
            // Mendapatkan data logo untuk pengecekan
            let logoGet = await Logo.findOne();

            // Cek apakah data logo ada
            if (!logoGet) {
                res.status(404).json(response(404, 'logo not found'));
                return;
            }

            // Membuat schema untuk validasi
            const schema = {
                logo_mpp: { type: "string", optional: true },
                logo_lamtim: { type: "string", optional: true }
            };

            let logo_mppKey, logo_lamtimKey;

            if (req.files && req.files.logo_mpp) {
                const file = req.files.logo_mpp[0];
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `${process.env.PATH_AWS}/logo_mpp/${uniqueFileName}`,
                    Body: file.buffer,
                    ACL: 'public-read',
                    ContentType: file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);

                await s3Client.send(command);

                logo_mppKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            if (req.files && req.files.logo_lamtim) {
                const file = req.files.logo_lamtim[0];
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `${process.env.PATH_AWS}/logo_lamtim/${uniqueFileName}`,
                    Body: file.buffer,
                    ACL: 'public-read',
                    ContentType: file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);

                await s3Client.send(command);

                logo_lamtimKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            // Buat object logo
            let logoUpdateObj = {
                logo_mpp: req.files.logo_mpp ? logo_mppKey : undefined,
                logo_lamtim: req.files.logo_lamtim ? logo_lamtimKey : undefined,
            };

            // Validasi menggunakan module fastest-validator
            const validate = v.validate(logoUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            // Update logo
            await Logo.update(logoUpdateObj, {
                where: {
                    id: logoGet.id,
                },
            });

            // Mendapatkan data logo setelah update
            let logoAfterUpdate = await Logo.findOne();

            // Response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update logo', logoAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

}