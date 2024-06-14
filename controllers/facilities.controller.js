const { response } = require('../helpers/response.formatter');
const { Facilities } = require('../models');
const Validator = require("fastest-validator");
const v = new Validator();
const { generatePagination } = require('../pagination/pagination');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

module.exports = {

    //membuat Facilities
    createFacilities: async (req, res) => {
        try {

            //membuat schema untuk validasi
            const schema = {
                image: {
                    type: "string",
                    optional: true
                },
            }

            if (req.file) {
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${req.file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `mpp/facilities/${uniqueFileName}`,
                    Body: req.file.buffer,
                    ACL: 'public-read',
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);

                await s3Client.send(command);

                imageKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            //buat object Facilities
            let FacilitiesCreateObj = {
                image: req.file ? imageKey : null,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(FacilitiesCreateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //buat Facilities
            let FacilitiesCreate = await Facilities.create(FacilitiesCreateObj);

            //response menggunakan helper response.formatter
            res.status(201).json(response(201, 'success create Facilities', FacilitiesCreate));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan semua data Facilities
    getFacilities: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            let FacilitiesGets;
            let totalCount;

            [FacilitiesGets, totalCount] = await Promise.all([
                Facilities.findAll({
                    limit: limit,
                    offset: offset
                }),
                Facilities.count()
            ]);

            const pagination = generatePagination(totalCount, page, limit, '/api/user/facilities/get');

            res.status(200).json({
                status: 200,
                message: 'success get Facilities',
                data: FacilitiesGets,
                pagination: pagination
            });

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan data Facilities berdasarkan id
    getFacilitiesById: async (req, res) => {
        try {
            //mendapatkan data Facilities berdasarkan id
            let FacilitiesGet = await Facilities.findOne({
                where: {
                    id: req.params.id
                },
            });

            //cek jika Facilities tidak ada
            if (!FacilitiesGet) {
                res.status(404).json(response(404, 'Facilities not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get Facilities by id', FacilitiesGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate Facilities berdasarkan id
    updateFacilities: async (req, res) => {
        try {
            //mendapatkan data Facilities untuk pengecekan
            let FacilitiesGet = await Facilities.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data Facilities ada
            if (!FacilitiesGet) {
                res.status(404).json(response(404, 'Facilities not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                image: {
                    type: "string",
                    optional: true
                },
            }

            if (req.file) {
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${req.file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `mpp/facilities/${uniqueFileName}`,
                    Body: req.file.buffer,
                    ACL: 'public-read',
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);
                await s3Client.send(command);
                
                imageKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            //buat object Facilities
            let FacilitiesUpdateObj = {
                image: req.file ? imageKey : FacilitiesGet.image,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(FacilitiesUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update Facilities
            await Facilities.update(FacilitiesUpdateObj, {
                where: {
                    id: req.params.id,
                }
            })

            //mendapatkan data Facilities setelah update
            let FacilitiesAfterUpdate = await Facilities.findOne({
                where: {
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update Facilities', FacilitiesAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //menghapus Facilities berdasarkan id
    deleteFacilities: async (req, res) => {
        try {

            //mendapatkan data Facilities untuk pengecekan
            let FacilitiesGet = await Facilities.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data Facilities ada
            if (!FacilitiesGet) {
                res.status(404).json(response(404, 'Facilities not found'));
                return;
            }

            await Facilities.destroy({
                where: {
                    id: req.params.id,
                }
            })

            res.status(200).json(response(200, 'success delete Facilities'));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    }
}