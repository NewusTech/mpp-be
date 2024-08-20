const { response } = require('../helpers/response.formatter');

const { Pengumuman } = require('../models');

const Validator = require("fastest-validator");
const v = new Validator();
const { Op } = require('sequelize');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const Redis = require("ioredis");
const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
});

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    useAccelerateEndpoint: true
});

module.exports = {

    //mendapatkan data pengumuman berdasarkan id
    getpengumuman: async (req, res) => {
        try {
            //mendapatkan data pengumuman berdasarkan id
            let pengumumanGet = await Pengumuman.findOne();

            //cek jika pengumuman tidak ada
            if (!pengumumanGet) {
                res.status(404).json(response(404, 'pengumuman not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get pengumuman by id', pengumumanGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate pengumuman berdasarkan id
    updatepengumuman: async (req, res) => {
        try {
            // Mendapatkan data pengumuman untuk pengecekan
            let pengumumanGet = await Pengumuman.findOne();
    
            // Cek apakah data pengumuman ada
            if (!pengumumanGet) {
                res.status(404).json(response(404, 'pengumuman not found'));
                return;
            }
    
            // Membuat schema untuk validasi
            const schema = {
                file: {
                    type: "string",
                    optional: true
                }
            };
    
            let pengumumanKey;
    
            if (req.file) {
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${req.file.originalname}`;
    
                const redisKey = `upload:pengumuman:${pengumumanGet.id}`;
                await redisClient.set(redisKey, JSON.stringify({
                    buffer: req.file.buffer,
                    mimetype: req.file.mimetype,
                    uniqueFileName,
                    folderPath: `${process.env.PATH_AWS}/pengumuman`
                }), 'EX', 60 * 60); // Expire in 1 hour
    
                pengumumanKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.PATH_AWS}/pengumuman/${uniqueFileName}`;
            }
    
            // Buat object pengumuman
            let pengumumanUpdateObj = {
                file: req.file ? pengumumanKey : undefined,
            };
    
            // Validasi menggunakan module fastest-validator
            const validate = v.validate(pengumumanUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }
    
            // Update pengumuman
            await Pengumuman.update(pengumumanUpdateObj, {
                where: {
                    id: pengumumanGet.id,
                },
            });
    
            // Mendapatkan data pengumuman setelah update
            let pengumumanAfterUpdate = await Pengumuman.findOne();
    
            // Mulai proses background untuk mengunggah ke S3
            if (req.file) {
                setTimeout(async () => {
                    const redisKey = `upload:pengumuman:${pengumumanGet.id}`;
                    const fileData = await redisClient.get(redisKey);
    
                    if (fileData) {
                        const { buffer, mimetype, uniqueFileName, folderPath } = JSON.parse(fileData);
                        const uploadParams = {
                            Bucket: process.env.AWS_S3_BUCKET,
                            Key: `${folderPath}/${uniqueFileName}`,
                            Body: Buffer.from(buffer),
                            ACL: 'public-read',
                            ContentType: mimetype
                        };
                        const command = new PutObjectCommand(uploadParams);
                        await s3Client.send(command);
                        await redisClient.del(redisKey); // Hapus dari Redis setelah berhasil diunggah
                    }
                }, 0); // Jalankan segera dalam background
            }
    
            // Response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update pengumuman', pengumumanAfterUpdate));
    
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },    

}