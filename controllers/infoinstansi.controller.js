const { response } = require('../helpers/response.formatter');
const { Instansi, Infoinstansi, sequelize } = require('../models');
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

    get: async (req, res) => {
        try {
            let instansiinfo = await Instansi.findOne({
                where: {
                    id: req.params.idinstansi
                },
                attributes: ['id', 'name'],
                include: [
                    {
                        model: Infoinstansi,
                    }
                ]
            });
            if (!instansiinfo) {
                return res.status(404).send('Data tidak ditemukan');
            }

            res.status(200).json(response(200, 'success get data', instansiinfo));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    edit: async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            // mendapatkan data untuk pengecekan
            let instansiinfoGet = await Instansi.findOne({
                where: {
                    id: req.params.idinstansi
                },
                include: [
                    { model: Infoinstansi }
                ],
                transaction
            });

            // cek apakah data ada
            if (!instansiinfoGet) {
                await transaction.rollback();
                return res.status(404).json(response(404, 'data not found'));
            }

            // membuat schema untuk validasi
            const schema = {
                title: { type: "string", optional: true },
                content: { type: "string", optional: true },
                image: { type: "string", optional: true }
            };

            if (req.file) {
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${req.file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `${process.env.PATH_AWS}/infoinstansi/${uniqueFileName}`,
                    Body: req.file.buffer,
                    ACL: 'public-read',
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);

                await s3Client.send(command);

                imageKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            // buat object
            let infoinstansiObj = {
                title: req.body.title,
                content: req.body.content,
                image: req.file ? imageKey : undefined,
            };

            // validasi menggunakan module fastest-validator
            const validate = v.validate(infoinstansiObj, schema);
            if (validate.length > 0) {
                await transaction.rollback();
                return res.status(400).json(response(400, 'validation failed', validate));
            }

            // first or create infoinstansi
            if (infoinstansiObj.title || infoinstansiObj.content) {
                let infoinstansiUpdateObj = {};
                if (infoinstansiObj.title) infoinstansiUpdateObj.title = infoinstansiObj.title;
                if (infoinstansiObj.content) infoinstansiUpdateObj.content = infoinstansiObj.content;
                if (infoinstansiObj.image) infoinstansiUpdateObj.image = infoinstansiObj.image;

                let [infoinstansi, created] = await Infoinstansi.findOrCreate({
                    where: { instansi_id: instansiinfoGet.id },
                    defaults: infoinstansiUpdateObj,
                    transaction
                });

                if (!created) {
                    await Infoinstansi.update(infoinstansiUpdateObj, {
                        where: { instansi_id: instansiinfoGet.id },
                        transaction
                    });
                }
            }

            await transaction.commit();

            res.status(200).json(response(200, 'success update'));

        } catch (err) {
            await transaction.rollback();
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },
};
