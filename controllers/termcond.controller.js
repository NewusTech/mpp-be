const { response } = require('../helpers/response.formatter');

const { Termcond } = require('../models');

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

    //mendapatkan data termcond berdasarkan id
    gettermcond: async (req, res) => {
        try {
            //mendapatkan data termcond berdasarkan id
            let termcondGet = await Termcond.findOne();

            //cek jika termcond tidak ada
            if (!termcondGet) {
                res.status(404).json(response(404, 'termcond not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get termcond by id', termcondGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate termcond berdasarkan id
    updatetermcond: async (req, res) => {
        try {
            //mendapatkan data termcond untuk pengecekan
            let termcondGet = await Termcond.findOne()

            //cek apakah data termcond ada
            if (!termcondGet) {
                res.status(404).json(response(404, 'termcond not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                desc: {
                    type: "string",
                    min: 3,
                    optional: true
                },
                privasi: {
                    type: "string",
                    min: 3,
                    optional: true
                },
            }

            let descKey, privasiKey;

            if (req.files && req.files.desc) {
                const file = req.files.desc[0];
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `${process.env.PATH_AWS}/descterm/${uniqueFileName}`,
                    Body: file.buffer,
                    ACL: 'public-read',
                    ContentType: file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);

                await s3Client.send(command);

                descKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            if (req.files && req.files.privasi) {
                const file = req.files.privasi[0];
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `${process.env.PATH_AWS}/privasiterm/${uniqueFileName}`,
                    Body: file.buffer,
                    ACL: 'public-read',
                    ContentType: file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);

                await s3Client.send(command);

                privasiKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

              // Buat object desc
              let descUpdateObj = {
                desc: req.files.desc ? descKey : undefined,
                privasi: req.files.privasi ? privasiKey : undefined,
            };

            // Validasi menggunakan module fastest-validator
            const validate = v.validate(descUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            // Update desc
            await Termcond.update(descUpdateObj, {
                where: { id: termcondGet.id },
            });

            // Mendapatkan data desc setelah update
            let descAfterUpdate = await Termcond.findOne();

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update termcond', descAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

}