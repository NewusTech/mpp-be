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
            //mendapatkan data manualbook untuk pengecekan
            let manualbookGet = await Manualbook.findOne()

            //cek apakah data manualbook ada
            if (!manualbookGet) {
                res.status(404).json(response(404, 'manualbook not found'));
                return;
            }

              //membuat schema untuk validasi
              const schema = {
                dokumen: {
                    type: "string",
                    optional: true
                }
            }

            if (req.file) {
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${req.file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `dir_mpp/manualbook/${uniqueFileName}`,
                    Body: req.file.buffer,
                    ACL: 'public-read',
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);

                await s3Client.send(command);

                manualbookKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            //buat object manualbook
            let manualbookUpdateObj = {
                dokumen: req.file ? manualbookKey : undefined,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(manualbookUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update manualbook
            await Manualbook.update(manualbookUpdateObj, {
                where: {
                  id: manualbookGet.id,
                },
              });

            //mendapatkan data manualbook setelah update
            let manualbookAfterUpdate = await Manualbook.findOne()

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update manualbook', manualbookAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

}