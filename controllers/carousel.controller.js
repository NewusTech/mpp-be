const { response } = require('../helpers/response.formatter');
const { Carousel } = require('../models');
const Validator = require("fastest-validator");
const v = new Validator();
const { generatePagination } = require('../pagination/pagination');
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

    //membuat Carousel
    createCarousel: async (req, res) => {
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
                    Key: `${process.env.PATH_AWS}/carousel/${uniqueFileName}`,
                    Body: req.file.buffer,
                    ACL: 'public-read',
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);

                await s3Client.send(command);

                imageKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            //buat object Carousel
            let CarouselCreateObj = {
                image: req.file ? imageKey : null,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(CarouselCreateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //buat Carousel
            let CarouselCreate = await Carousel.create(CarouselCreateObj);

            //response menggunakan helper response.formatter
            res.status(201).json(response(201, 'success create Carousel', CarouselCreate));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan semua data Carousel
    getCarousel: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            let CarouselGets;
            let totalCount;

            [CarouselGets, totalCount] = await Promise.all([
                Carousel.findAll({
                    limit: limit,
                    offset: offset
                }),
                Carousel.count()
            ]);

            const pagination = generatePagination(totalCount, page, limit, '/api/user/carousel/get');

            res.status(200).json({
                status: 200,
                message: 'success get Carousel',
                data: CarouselGets,
                pagination: pagination
            });

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan data Carousel berdasarkan id
    getCarouselById: async (req, res) => {
        try {
            //mendapatkan data Carousel berdasarkan id
            let CarouselGet = await Carousel.findOne({
                where: {
                    id: req.params.id
                },
            });

            //cek jika Carousel tidak ada
            if (!CarouselGet) {
                res.status(404).json(response(404, 'Carousel not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get Carousel by id', CarouselGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate Carousel berdasarkan id
    updateCarousel: async (req, res) => {
        try {
            //mendapatkan data Carousel untuk pengecekan
            let CarouselGet = await Carousel.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data Carousel ada
            if (!CarouselGet) {
                res.status(404).json(response(404, 'Carousel not found'));
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
                    Key: `${process.env.PATH_AWS}/carousel/${uniqueFileName}`,
                    Body: req.file.buffer,
                    ACL: 'public-read',
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);
                await s3Client.send(command);
                
                imageKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            //buat object Carousel
            let CarouselUpdateObj = {
                image: req.file ? imageKey : CarouselGet.image,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(CarouselUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update Carousel
            await Carousel.update(CarouselUpdateObj, {
                where: {
                    id: req.params.id,
                }
            })

            //mendapatkan data Carousel setelah update
            let CarouselAfterUpdate = await Carousel.findOne({
                where: {
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update Carousel', CarouselAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //menghapus Carousel berdasarkan id
    deleteCarousel: async (req, res) => {
        try {

            //mendapatkan data Carousel untuk pengecekan
            let CarouselGet = await Carousel.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data Carousel ada
            if (!CarouselGet) {
                res.status(404).json(response(404, 'Carousel not found'));
                return;
            }

            await Carousel.destroy({
                where: {
                    id: req.params.id,
                }
            })

            res.status(200).json(response(200, 'success delete Carousel'));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    }
}