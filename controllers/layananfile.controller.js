const { response } = require('../helpers/response.formatter');

const { Layananfile, Layananformnum, Layananform, Layanan, Instansi, Userinfo, Surveyformnum, Desa, Kecamatan, sequelize } = require('../models');
require('dotenv').config()

const Validator = require("fastest-validator");
const v = new Validator();
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const moment = require('moment-timezone');
const { Op } = require('sequelize');
const { generatePagination } = require('../pagination/pagination');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const nodemailer = require('nodemailer');
const { format } = require('date-fns');
const { id } = require('date-fns/locale');

const Redis = require("ioredis");
const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
});

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_NAME,
        pass: process.env.EMAIL_PW,
    }
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

    //input form user
    input: async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const folderPaths = {
                fileinput: "dir_mpp/layanan_file",
            };

            const idlayanan = req.params.idlayanan;

            let { datafile } = req.body;

            const files = req.files;
            let redisUploadPromises = files.map(async (file) => {
                const { fieldname, mimetype, buffer, originalname } = file;

                const now = new Date();
                const timestamp = now.toISOString().replace(/[-:.]/g, '');
                const uniqueFilename = `${originalname.split('.')[0]}_${timestamp}`;

                const redisKey = `upload:${fieldname}`;
                await redisClient.set(redisKey, JSON.stringify({
                    buffer,
                    mimetype,
                    originalname,
                    uniqueFilename,
                    folderPath: folderPaths.fileinput
                }), 'EX', 60 * 60); // Expire in 1 hour

                const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${folderPaths.fileinput}/${uniqueFilename}`;

                // Extract index from fieldname (e.g., 'datafile[0][data]' -> 0)
                const index = parseInt(fieldname.match(/\d+/)[0], 10);
                datafile[index].file = fileUrl;
            });

            await Promise.all(redisUploadPromises);

            // Update datafile with layananformnum_id
            if (datafile) {
                datafile = datafile.map(item => ({
                    ...item,
                    layanan_id: idlayanan
                }));
            }

            let createdLayananformfile;
            if (datafile) {
                createdLayananformfile = await Layananfile.bulkCreate(datafile, { transaction });
            }

            await transaction.commit();

            // Mulai proses background untuk mengunggah ke S3
            setTimeout(async () => {
                for (const file of files) {
                    const { fieldname } = file;
                    const redisKey = `upload:${fieldname}`;
                    const fileData = await redisClient.get(redisKey);

                    if (fileData) {
                        const { buffer, mimetype, originalname, uniqueFilename, folderPath } = JSON.parse(fileData);
                        const uploadParams = {
                            Bucket: process.env.AWS_S3_BUCKET,
                            Key: `${folderPath}/${uniqueFilename}`,
                            Body: Buffer.from(buffer),
                            ACL: 'public-read',
                            ContentType: mimetype
                        };
                        const command = new PutObjectCommand(uploadParams);
                        await s3Client.send(command);
                        await redisClient.del(redisKey); // Hapus dari Redis setelah berhasil diunggah
                    }
                }
            }, 0); // Jalankan segera dalam background

            res.status(201).json(response(201, 'Success create layanan file'));
        } catch (err) {
            await transaction.rollback();
            res.status(500).json(response(500, 'Internal server error', err));
            console.error(err);
        }
    },

    get: async (req, res) => {
        try {
            const idlayanan = req.params.idlayanan;

            let layananData = await Layanan.findOne({
                where: {
                    id: idlayanan
                },
                attributes: ['id' ,'name', 'desc', 'image'],
                include: [
                    {
                        model: Layananfile,
                    },
                ]
            });

            if (!layananData) {
                res.status(404).json(response(404, 'data not found'));
                return;
            }

            res.status(200).json(response(200, 'success get data', layananData));
        } catch (err) {
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

    update: async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const idlayanan = req.params.idlayanan;

            // Update data entries
            let updateDataPromises = [];

            const files = req.files;
            const folderPath = { fileinput: "dir_mpp/layanan_file" };

            let redisUploadPromises = files.map(async (file) => {
                const { fieldname, mimetype, buffer, originalname } = file;
                const base64 = Buffer.from(buffer).toString('base64');
                const dataURI = `data:${mimetype};base64,${base64}`;

                const now = new Date();
                const timestamp = now.toISOString().replace(/[-:.]/g, '');
                const uniqueFilename = `${originalname.split('.')[0]}_${timestamp}`;

                const redisKey = `upload:${idlayanan}:${fieldname}`;
                await redisClient.set(redisKey, JSON.stringify({
                    buffer,
                    mimetype,
                    originalname,
                    uniqueFilename,
                    folderPath: folderPath.fileinput
                }), 'EX', 60 * 60); // Expire in 1 hour

                const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${folderPath.fileinput}/${uniqueFilename}`;

                // Extract index from fieldname (e.g., 'datafile[0][data]' -> 0)
                const index = parseInt(fieldname.match(/\d+/)[0], 10);

                // Assuming datafile[index].id is available in req.body to identify the correct record
                await Layananfile.update(
                    { 
                        file: fileUrl, 
                        name: req.body.datafile[index].name,
                        link: req.body.datafile[index].link 
                    },
                    { where: { id: req.body.datafile[index].id, layanan_id: idlayanan }, transaction }
                );
            });

            await Promise.all([...updateDataPromises, ...redisUploadPromises]);

            await transaction.commit();

            // Mulai proses background untuk mengunggah ke S3
            setTimeout(async () => {
                for (const file of files) {
                    const { fieldname } = file;
                    const redisKey = `upload:${idlayanan}:${fieldname}`;
                    const fileData = await redisClient.get(redisKey);

                    if (fileData) {
                        const { buffer, mimetype, originalname, uniqueFilename, folderPath } = JSON.parse(fileData);
                        const uploadParams = {
                            Bucket: process.env.AWS_S3_BUCKET,
                            Key: `${folderPath}/${uniqueFilename}`,
                            Body: Buffer.from(buffer),
                            ACL: 'public-read',
                            ContentType: mimetype
                        };
                        const command = new PutObjectCommand(uploadParams);
                        await s3Client.send(command);
                        await redisClient.del(redisKey); // Hapus dari Redis setelah berhasil diunggah
                    }
                }
            }, 0); // Jalankan segera dalam background

            res.status(200).json(response(200, 'Success update layanan'));
        } catch (err) {
            await transaction.rollback();
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

    delete: async (req, res) => {
        try {

            //mendapatkan data Layananfile untuk pengecekan
            let LayananfileGet = await Layananfile.findOne({
                where: {
                    id: req.params.idlayanan
                }
            })

            //cek apakah data Layananfile ada
            if (!LayananfileGet) {
                res.status(404).json(response(404, 'Layananfile not found'));
                return;
            }

            await Layananfile.destroy({
                where: {
                    id: req.params.idlayanan,
                }
            })

            res.status(200).json(response(200, 'success delete Layananfile'));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    }

}