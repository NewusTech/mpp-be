const { response } = require('../helpers/response.formatter');

const { Manualbook } = require('../models');

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

    //mendapatkan data manualbook berdasarkan id
    getmanualbook: async (req, res) => {
        try {
            //mendapatkan data manualbook berdasarkan id
            let manualbookGet = await Manualbook.findOne();

            //cek jika manualbook tidak ada
            if (!manualbookGet) {
                res.status(404).json(response(404, 'manualbook not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get manualbook by id', manualbookGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate manualbook berdasarkan id
    updatemanualbook: async (req, res) => {
        try {
            // Mendapatkan data manualbook untuk pengecekan
            let manualbookGet = await Manualbook.findOne();

            // Cek apakah data manualbook ada
            if (!manualbookGet) {
                res.status(404).json(response(404, 'manualbook not found'));
                return;
            }

            // Membuat schema untuk validasi
            const schema = {
                dokumen: { type: "string", optional: true },
                video: { type: "string", optional: true }
            };

            let manualbookKey, videoKey;

            if (req.files && req.files.manualbook) {
                const file = req.files.manualbook[0];
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `${process.env.PATH_AWS}/manualbook/${uniqueFileName}`,
                    Body: file.buffer,
                    ACL: 'public-read',
                    ContentType: file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);

                await s3Client.send(command);

                manualbookKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            if (req.files && req.files.video) {
                const file = req.files.video[0];
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `${process.env.PATH_AWS}/videomanualbook/${uniqueFileName}`,
                    Body: file.buffer,
                    ACL: 'public-read',
                    ContentType: file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);

                await s3Client.send(command);

                videoKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            // Buat object manualbook
            let manualbookUpdateObj = {
                dokumen: req.files.manualbook ? manualbookKey : undefined,
                video: req.files.video ? videoKey : undefined,
            };

            // Validasi menggunakan module fastest-validator
            const validate = v.validate(manualbookUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            // Update manualbook
            await Manualbook.update(manualbookUpdateObj, {
                where: { id: manualbookGet.id },
            });

            // Mendapatkan data manualbook setelah update
            let manualbookAfterUpdate = await Manualbook.findOne();

            // Response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update manualbook', manualbookAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

}