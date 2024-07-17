const { response } = require('../helpers/response.formatter');

const { Video } = require('../models');

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

    //mendapatkan data video berdasarkan id
    getvideo: async (req, res) => {
        try {
            //mendapatkan data video berdasarkan id
            let videoGet = await Video.findOne();

            //cek jika video tidak ada
            if (!videoGet) {
                res.status(404).json(response(404, 'video not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get video by id', videoGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate video berdasarkan id
    updatevideo: async (req, res) => {
        try {
            //mendapatkan data video untuk pengecekan
            let videoGet = await Video.findOne()

            //cek apakah data video ada
            if (!videoGet) {
                res.status(404).json(response(404, 'video not found'));
                return;
            }

              //membuat schema untuk validasi
              const schema = {
                video: {
                    type: "string",
                    optional: true
                }
            }

            if (req.file) {
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${req.file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `${process.env.PATH_AWS}/video/${uniqueFileName}`,
                    Body: req.file.buffer,
                    ACL: 'public-read',
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);

                await s3Client.send(command);

                videoKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            //buat object video
            let videoUpdateObj = {
                video: req.file ? videoKey : undefined,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(videoUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update video
            await Video.update(videoUpdateObj, {
                where: {
                  id: videoGet.id,
                },
              });

            //mendapatkan data video setelah update
            let videoAfterUpdate = await Video.findOne()

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update video', videoAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

}