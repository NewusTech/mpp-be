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
        try {

            //membuat schema untuk validasi
            const schema = {
                name: { type: "string" },
                layanan_id: { type: "number" }
            }

            if (req.file) {
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${req.file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `${process.env.PATH_AWS}/layanan_file/${uniqueFileName}`,
                    Body: req.file.buffer,
                    ACL: 'public-read',
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);

                await s3Client.send(command);

                fileKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            //buat object layanan
            let layananCreateObj = {
                name: req.body.name,
                layanan_id: Number(req.params.idlayanan),
                file: req.file ? fileKey : undefined,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(layananCreateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //buat layanan
            let layananCreate = await Layananfile.create(layananCreateObj);

            //response menggunakan helper response.formatter
            res.status(201).json(response(201, 'success create', layananCreate));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
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
        try {
            //mendapatkan data layanan untuk pengecekan
            let layananGet = await Layananfile.findOne({
                where: {
                    id: req.params.id,
                }
            })

            //cek apakah data layanan ada
            if (!layananGet) {
                res.status(404).json(response(404, 'layanan not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                name: { type: "string", optional: true },
            }

            if (req.file) {
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${req.file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `${process.env.PATH_AWS}/layanan/${uniqueFileName}`,
                    Body: req.file.buffer,
                    ACL: 'public-read',
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);

                await s3Client.send(command);

                fileKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            //buat object layanan
            let layananUpdateObj = {
                name: req.body.name,
                file: req.file ? fileKey : layananGet.file,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(layananUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update layanan
            await Layananfile.update(layananUpdateObj, {
                where: {
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update'));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
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