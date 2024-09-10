const { response } = require('../helpers/response.formatter');

const { Instansi, Layanan, Layananformnum, Apkinstansi, Userinfo, Pengaduan, Antrian, sequelize } = require('../models');

const slugify = require('slugify');
const Validator = require("fastest-validator");
const v = new Validator();
const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');
const moment = require('moment-timezone');
const { generatePagination } = require('../pagination/pagination');
const { Op, Sequelize } = require('sequelize');
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

    //membuat instansi
    createinstansi: async (req, res) => {
        try {

            //membuat schema untuk validasi
            const schema = {
                name: { type: "string" },
                desc: { type: "string", optional: true },
                code: { type: "string", optional: true },
                pj: { type: "string", optional: true },
                nip_pj: { type: "string", optional: true },
                alamat: { type: "string", optional: true },
                image: { type: "string", optional: true },
                linkmaps: { type: "string", optional: true },
                website: { type: "string", optional: true },
                active_offline: { type: "number", optional: true },
                active_online: { type: "number", optional: true },
                status: { type: "number", optional: true },
                telp: { type: "string", optional: true, min: 7, max: 15 },
                email: { type: "string", min: 5, max: 100, pattern: /^\S+@\S+\.\S+$/, optional: true },
                jam_buka: { type: "string", optional: true },
                jam_tutup: { type: "string", optional: true }
            }

            if (req.file) {
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${req.file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `${process.env.PATH_AWS}/instansi/${uniqueFileName}`,
                    Body: req.file.buffer,
                    ACL: 'public-read',
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);

                await s3Client.send(command);

                imageKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            //buat object instansi
            let instansiCreateObj = {
                name: req.body.name,
                slug: req.body.name ? slugify(req.body.name, { lower: true }) : undefined,
                desc: req.body.desc,
                code: req.body.code,
                pj: req.body.pj,
                nip_pj: req.body.nip_pj,
                telp: req.body.telp,
                email: req.body.email,
                linkmaps: req.body.linkmaps,
                website: req.body.website,
                active_offline: req.body.active_offline ? Number(req.body.active_offline) : 0,
                active_online: req.body.active_online ? Number(req.body.active_online) : 0,
                status: req.body.status ? Number(req.body.status) : 0,
                alamat: req.body.alamat,
                image: req.file ? imageKey : undefined,
                jam_buka: req.body.jam_buka,
                jam_tutup: req.body.jam_tutup
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(instansiCreateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //mendapatkan data data untuk pengecekan
            let dataGets = await Instansi.findOne({
                where: {
                    slug: instansiCreateObj.slug
                }
            }
            );

            //cek apakah slug sudah terdaftar
            if (dataGets) {
                res.status(409).json(response(409, 'slug already registered'));
                return;
            }

            //buat instansi
            let instansiCreate = await Instansi.create(instansiCreateObj);

            //response menggunakan helper response.formatter
            res.status(201).json(response(201, 'success create instansi', instansiCreate));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan semua data instansi
    getinstansi: async (req, res) => {
        try {
            let { search, pengaduan, skm } = req.query;
            const showDeleted = req.query.showDeleted ?? null;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            let instansiGets;
            let totalCount;

            const whereCondition = {};

            if (data?.role === "Admin Instansi" || data?.role === "Super Admin" || data?.role === "Bupati" || data?.role === "Admin Verifikasi") {
            } else {
                whereCondition.status = true;
            }

            let includeOptions = [];
            let isrequired = false

            if (pengaduan && data?.role === 'User') {
                isrequired = true
                includeOptions = [{
                    model: Layananformnum,
                    attributes: [],
                    required: true,
                    where: {
                        userinfo_id: data?.user_akun_id
                    }
                }];
            }

            if (skm && data?.role === 'User') {
                isrequired = true
                includeOptions = [{
                    model: Layananformnum,
                    attributes: [],
                    required: true,
                    where: {
                        userinfo_id: data?.user_akun_id
                    }
                }];
            }

            if (showDeleted !== null) {
                whereCondition.deletedAt = { [Op.not]: null };
            } else {
                whereCondition.deletedAt = null;
            }

            if (search) {
                whereCondition[Op.or] = [
                    { name: { [Op.iLike]: `%${search}%` } },
                    {
                        [Op.and]: Sequelize.literal(`
                            EXISTS (
                                SELECT 1 
                                FROM "Layanans" 
                                WHERE "Layanans"."instansi_id" = "Instansi"."id" 
                                AND "Layanans"."name" ILIKE '%${search}%'
                            )
                        `)
                    }
                ];
            }

            [instansiGets, totalCount] = await Promise.all([
                Instansi.findAll({
                    where: whereCondition,
                    include: [
                        {
                            model: Layanan,
                            as: 'Layanans',
                            attributes: ['id', 'name'],
                            where: {
                                status: true,
                                deletedAt: null
                            },
                            include: includeOptions,
                            required: isrequired
                        }
                    ],
                    offset: offset,
                    limit: limit,
                    order: [
                        ['status', 'DESC'],
                        ['id', 'ASC']
                    ],
                }),
                Instansi.count({
                    where: whereCondition,
                    include: [
                        {
                            model: Layanan,
                            as: 'Layanans',
                            attributes: [],
                            where: {
                                status: true,
                                deletedAt: null
                            },
                            include: includeOptions,
                            required: isrequired
                        }
                    ],
                    distinct: true
                })
            ]);

            const formattedInstansiGets = instansiGets.map(instansi => {
                const { id, name, code, slug, alamat, telp, email, desc, pj, nip_pj, image, linkmaps, website, active_online, active_offline, status, jam_buka, jam_tutup, createdAt, updatedAt, deletedAt } = instansi.toJSON();
                const jmlLayanan = instansi.Layanans.length;
                return {
                    id, name, code, slug, alamat, telp, email, desc, pj, nip_pj, image, linkmaps, website, active_online, active_offline, status, jam_buka, jam_tutup, createdAt, updatedAt, deletedAt, jmlLayanan
                };
            });

            const pagination = generatePagination(totalCount, page, limit, '/api/user/instansi/get');

            res.status(200).json({
                status: 200,
                message: 'success get instansi',
                data: formattedInstansiGets,
                pagination: pagination
            });

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan data instansi berdasarkan slug
    getinstansiBySlug: async (req, res) => {
        try {
            const showDeleted = req.query.showDeleted ?? null;
            const whereCondition = { slug: req.params.slug };

            if (showDeleted !== null) {
                whereCondition.deletedAt = { [Op.not]: null };
            } else {
                whereCondition.deletedAt = null;
            }

            if (data?.role === "Admin Instansi" || data?.role === "Super Admin" || data?.role === "Bupati" || data?.role === "Admin Verifikasi") {
            } else {
                whereCondition.status = true;
            }

            let instansiGet = await Instansi.findOne({
                where: whereCondition,
                include: [
                    {
                        model: Layanan,
                        as: 'Layanans',
                        attributes: ['id', 'name', 'desc', 'syarat', 'dasarhukum'],
                        where: {
                            status: true,
                            deletedAt: null
                        },
                        required: false
                    },
                    {
                        model: Apkinstansi,
                    },
                ]
            });

            //cek jika instansi tidak ada
            if (!instansiGet) {
                res.status(404).json(response(404, 'instansi not found'));
                return;
            }

            const { id, name, code, slug, alamat, telp, email, desc, pj, nip_pj, image, linkmaps, website, active_online, active_offline, status, jam_buka, jam_tutup, createdAt, updatedAt, deletedAt, Layanans, Apkinstansis } = instansiGet.toJSON();
            const jmlLayanan = Layanans.length;

            const formattedInstansiGets = {
                id, name, code, slug, alamat, telp, email, desc, pj, nip_pj, image, linkmaps, website, active_online, active_offline, status, jam_buka, jam_tutup, createdAt, updatedAt, deletedAt, jmlLayanan, Apkinstansis, Layanans // Include the services
            };

            res.status(200).json(response(200, 'success get instansi by slug', formattedInstansiGets));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate instansi berdasarkan slug
    updateinstansi: async (req, res) => {
        try {
            //mendapatkan data instansi untuk pengecekan
            let instansiGet = await Instansi.findOne({
                where: {
                    slug: req.params.slug,
                    deletedAt: null
                }
            })

            //cek apakah data instansi ada
            if (!instansiGet) {
                res.status(404).json(response(404, 'instansi not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                name: { type: "string", optional: true },
                desc: { type: "string", optional: true },
                code: { type: "string", optional: true },
                pj: { type: "string", optional: true },
                nip_pj: { type: "string", optional: true },
                alamat: { type: "string", optional: true },
                image: { type: "string", optional: true },
                linkmaps: { type: "string", optional: true },
                website: { type: "string", optional: true },
                active_offline: { type: "number", optional: true },
                active_online: { type: "number", optional: true },
                status: { type: "number", optional: true },
                telp: { type: "string", optional: true, min: 7, max: 15 },
                email: { type: "string", min: 5, max: 80, pattern: /^\S+@\S+\.\S+$/, optional: true },
                jam_buka: { type: "string", optional: true },
                jam_tutup: { type: "string", optional: true }
            }

            if (req.file) {
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${req.file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `${process.env.PATH_AWS}/instansi/${uniqueFileName}`,
                    Body: req.file.buffer,
                    ACL: 'public-read',
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);
                await s3Client.send(command);

                imageKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            //buat object instansi
            let instansiUpdateObj = {
                name: req.body.name,
                slug: req.body.name ? slugify(req.body.name, { lower: true }) : undefined,
                desc: req.body.desc,
                code: req.body.code,
                pj: req.body.pj,
                nip_pj: req.body.nip_pj,
                linkmaps: req.body.linkmaps,
                website: req.body.website,
                telp: req.body.telp,
                email: req.body.email,
                alamat: req.body.alamat,
                image: req.file ? imageKey : instansiGet.image,
                active_offline: req.body.active_offline ? Number(req.body.active_offline) : undefined,
                active_online: req.body.active_online ? Number(req.body.active_online) : undefined,
                status: req.body.status ? Number(req.body.status) : undefined,
                jam_buka: req.body.jam_buka,
                jam_tutup: req.body.jam_tutup
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(instansiUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update instansi
            await Instansi.update(instansiUpdateObj, {
                where: {
                    slug: req.params.slug,
                }
            })

            //mendapatkan data instansi setelah update
            let instansiAfterUpdate = await Instansi.findOne({
                where: {
                    slug: req.params.slug,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update instansi', instansiAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    deleteinstansi: async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            // Cari instansi yang belum dihapus (deletedAt === null)
            let instansiGet = await Instansi.findOne({
                where: {
                    slug: req.params.slug,
                    deletedAt: null
                },
                transaction
            });

            // Jika instansi tidak ditemukan, kirim respons 404
            if (!instansiGet) {
                await transaction.rollback();
                res.status(404).json(response(404, 'instansi not found'));
                return;
            }

            // Ambil semua model terkait dengan Instansi
            const models = Object.keys(sequelize.models);

            // Array untuk menyimpan promise update untuk setiap model terkait
            const updatePromises = [];

            // Lakukan soft delete pada semua model terkait
            models.forEach(async modelName => {
                const Model = sequelize.models[modelName];
                if (Model.associations && Model.associations.Instansi && Model.rawAttributes.deletedAt) {
                    updatePromises.push(
                        Model.update({ deletedAt: new Date() }, {
                            where: {
                                instansi_id: instansiGet.id
                            },
                            transaction
                        })
                    );
                }
            });

            // Jalankan semua promise update secara bersamaan
            await Promise.all(updatePromises);

            await Instansi.update({ deletedAt: new Date() }, {
                where: {
                    slug: req.params.slug
                },
                transaction
            });

            // Commit transaksi jika semua operasi berhasil
            await transaction.commit();

            res.status(200).json(response(200, 'success delete instansi'));

        } catch (err) {
            // Rollback transaksi jika terjadi kesalahan
            await transaction.rollback();
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

    reportkinerja: async (req, res) => {
        try {
            const WhereClause = {};
            const WhereClause2 = {};
            const WhereClause3 = {};
            const instansi_id = Number(req.params.instansi_id);
            const start_date = req.query.start_date;
            const end_date = req.query.end_date;

            if (start_date && end_date) {
                WhereClause3.createdAt = { [Op.between]: [moment(start_date).startOf('day').toDate(), moment(end_date).endOf('day').toDate()] };
            } else if (start_date) {
                WhereClause3.createdAt = { [Op.gte]: moment(start_date).startOf('day').toDate() };
            } else if (end_date) {
                WhereClause3.createdAt = { [Op.lte]: moment(end_date).endOf('day').toDate() };
            }

            if (instansi_id) {
                WhereClause.instansi_id = instansi_id;
                WhereClause2.id = instansi_id;
            }

            let instansi, layanan;

            [instansi, layanan] = await Promise.all([
                Instansi.findAll({
                    include: [{
                        model: Layanan,
                        attributes: ['id', 'name', 'slug'],
                        include: [{
                            model: Layananformnum,
                            attributes: ['id', 'status'],
                            where: WhereClause3,
                            required: false,
                        }],
                    }],
                    where: WhereClause2,
                    attributes: ['id', 'name', 'slug'],
                }),
                Layanan.findAll({
                    include: [{
                        model: Layananformnum,
                        attributes: ['id', 'status'],
                        where: WhereClause3,
                        required: false,
                    }],
                    where: WhereClause,
                    attributes: ['id', 'name', 'slug'],
                }),
            ]);

            // Menghitung kinerja per layanan
            const report_perlayanan = layanan.map(item => {
                const formnums = item.Layananformnums;
                const status3Count = formnums.filter(fn => fn.status === 3).length;
                const status4Count = formnums.filter(fn => fn.status === 4).length;
                const total = status3Count + status4Count;

                const kinerja = total > 0 ? (status3Count / total) * 100 : 0;

                return {
                    id: item.id,
                    name: item.name,
                    slug: item.slug,
                    kinerja: Math.round(kinerja), // Pembulatan nilai kinerja ke integer
                };
            });

            // Menghitung kinerja per instansi
            const report_perinstansi = instansi.map(inst => {
                const allLayanan = inst.Layanans;
                const totalLayanan = allLayanan.length;

                if (totalLayanan === 0) {
                    return {
                        id: inst.id,
                        name: inst.name,
                        slug: inst.slug,
                        kinerja: 0
                    };
                }

                const totalStatus3 = allLayanan.reduce((sum, lay) => {
                    return sum + lay.Layananformnums.filter(fn => fn.status === 3).length;
                }, 0);

                const totalStatus4 = allLayanan.reduce((sum, lay) => {
                    return sum + lay.Layananformnums.filter(fn => fn.status === 4).length;
                }, 0);

                const total = totalStatus3 + totalStatus4;
                const kinerja = total > 0 ? (totalStatus3 / total) * 100 : 0;

                return {
                    id: inst.id,
                    name: inst.name,
                    slug: inst.slug,
                    kinerja: Math.round(kinerja) // Pembulatan nilai kinerja ke integer
                };
            });

            res.status(200).json({
                status: 200,
                message: 'success get',
                data: {
                    instansi: report_perinstansi,
                    report_perlayanan
                },
            });

        } catch (err) {
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

    pdfreportkinerja: async (req, res) => {
        try {
            const WhereClause = {};
            const WhereClause2 = {};
            const WhereClause3 = {};
            const instansi_id = Number(req.params.instansi_id);
            const start_date = req.query.start_date;
            const end_date = req.query.end_date;

            if (start_date && end_date) {
                WhereClause3.createdAt = { [Op.between]: [moment(start_date).startOf('day').toDate(), moment(end_date).endOf('day').toDate()] };
            } else if (start_date) {
                WhereClause3.createdAt = { [Op.gte]: moment(start_date).startOf('day').toDate() };
            } else if (end_date) {
                WhereClause3.createdAt = { [Op.lte]: moment(end_date).endOf('day').toDate() };
            }

            if (instansi_id) {
                WhereClause.instansi_id = instansi_id;
                WhereClause2.id = instansi_id;
            }

            let instansi, layanan;

            [instansi, layanan] = await Promise.all([
                Instansi.findAll({
                    include: [{
                        model: Layanan,
                        attributes: ['id', 'name', 'slug'],
                        include: [{
                            model: Layananformnum,
                            attributes: ['id', 'status'],
                            where: WhereClause3,
                            required: false,
                        }],
                    }],
                    where: WhereClause2,
                    attributes: ['id', 'name', 'slug'],
                }),
                Layanan.findAll({
                    include: [{
                        model: Layananformnum,
                        attributes: ['id', 'status'],
                        where: WhereClause3,
                        required: false,
                    }],
                    where: WhereClause,
                    attributes: ['id', 'name', 'slug'],
                }),
            ]);

            // Menghitung kinerja per layanan
            const report_perlayanan = layanan.map(item => {
                const formnums = item.Layananformnums;
                const status3Count = formnums.filter(fn => fn.status === 3).length;
                const status4Count = formnums.filter(fn => fn.status === 4).length;
                const total = status3Count + status4Count;

                const kinerja = total > 0 ? (status3Count / total) * 100 : 0;

                return {
                    id: item.id,
                    name: item.name,
                    slug: item.slug,
                    kinerja: Math.round(kinerja), // Pembulatan nilai kinerja ke integer
                };
            });

            // Menghitung kinerja per instansi
            const report_perinstansi = instansi.map(inst => {
                const allLayanan = inst.Layanans;
                const totalLayanan = allLayanan.length;

                if (totalLayanan === 0) {
                    return {
                        id: inst.id,
                        name: inst.name,
                        slug: inst.slug,
                        kinerja: 0
                    };
                }

                const totalStatus3 = allLayanan.reduce((sum, lay) => {
                    return sum + lay.Layananformnums.filter(fn => fn.status === 3).length;
                }, 0);

                const totalStatus4 = allLayanan.reduce((sum, lay) => {
                    return sum + lay.Layananformnums.filter(fn => fn.status === 4).length;
                }, 0);

                const total = totalStatus3 + totalStatus4;
                const kinerja = total > 0 ? (totalStatus3 / total) * 100 : 0;

                return {
                    id: inst.id,
                    name: inst.name,
                    slug: inst.slug,
                    kinerja: Math.round(kinerja) // Pembulatan nilai kinerja ke integer
                };
            });

            const templatePath = path.resolve(__dirname, '../views/laporankinerja.html');
            let htmlContent = fs.readFileSync(templatePath, 'utf8');
            let instansiGet;

            if (instansi_id) {
                instansiGet = await Instansi.findOne({
                    where: {
                        id: instansi_id
                    },
                });
            }

            let tanggalInfo = '';
            if (start_date || end_date) {
                const startDateFormatted = start_date ? new Date(start_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
                const endDateFormatted = end_date ? new Date(end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
                tanggalInfo = `<p>Periode Tanggal : ${startDateFormatted} s.d. ${endDateFormatted ? endDateFormatted : 'Hari ini'} </p>`;
            }
            const reportTableRows = report_perlayanan.map(layanan => `
                <tr>
                    <td>${layanan.name}</td>
                    <td class="center">${layanan.kinerja}%</td>
                </tr>
            `).join('');

            const reportTableRows2 = report_perinstansi.map(instansi => `
                <tr>
                    <td>Kinerja ${instansi.name} : ${instansi.kinerja}%</td>
                </tr>
            `).join('');

            htmlContent = htmlContent.replace('{{reportTableRows2}}', reportTableRows2);
            htmlContent = htmlContent.replace('{{tanggalInfo}}', tanggalInfo);
            htmlContent = htmlContent.replace('{{reportTableRows}}', reportTableRows);

            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();

            // Set HTML content
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

            // Generate PDF
            const pdfBuffer = await page.pdf({
                format: 'A4',
                margin: {
                    top: '1.16in',
                    right: '1.16in',
                    bottom: '1.16in',
                    left: '1.16in'
                }
            });

            await browser.close();

            // Generate filename
            const currentDate = new Date().toISOString().replace(/:/g, '-');
            const filename = `laporan-${currentDate}.pdf`;

            // Send PDF buffer
            res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
            res.setHeader('Content-type', 'application/pdf');
            res.send(pdfBuffer);

        } catch (err) {
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

    reportdokumen: async (req, res) => {
        try {
            const search = req.query.search ?? null;
            const isonline = req.query.isonline ?? null;
            const instansi_id = Number(req.query.instansi_id);
            const layanan_id = Number(req.query.layanan_id);
            const start_date = req.query.start_date;
            let end_date = req.query.end_date;
            const year = req.query.year ? parseInt(req.query.year) : null;
            const month = req.query.month ? parseInt(req.query.month) : null;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            let history;
            let totalCount;

            const WhereClause = {};
            const WhereClause2 = {};
            const WhereClause3 = {};

            WhereClause.status = 3;

            if (data.role === 'Admin Instansi' || data.role === 'Admin Verifikasi' || data.role === 'Admin Layanan') {
                WhereClause2.instansi_id = data.instansi_id;
            }

            if (data.role === 'Admin Layanan') {
                WhereClause.layanan_id = data.layanan_id;
            }

            if (isonline) {
                WhereClause.isonline = isonline;
            }

            if (layanan_id) {
                WhereClause.layanan_id = layanan_id;
            }

            if (start_date && end_date) {
                end_date = new Date(end_date);
                end_date.setHours(23, 59, 59, 999);
                WhereClause.createdAt = {
                    [Op.between]: [new Date(start_date), new Date(end_date)]
                };
            } else if (start_date) {
                WhereClause.createdAt = {
                    [Op.gte]: new Date(start_date)
                };
            } else if (end_date) {
                end_date = new Date(end_date);
                end_date.setHours(23, 59, 59, 999);
                WhereClause.createdAt = {
                    [Op.lte]: new Date(end_date)
                };
            }

            if (instansi_id && data.role === 'Super Admin') {
                WhereClause2.instansi_id = instansi_id;
            }

            if (search) {
                WhereClause3[Op.or] = [
                    { name: { [Op.iLike]: `%${search}%` } },
                    { '$Layanan.name$': { [Op.iLike]: `%${search}%` } },
                    { '$Layanan->Instansi.name$': { [Op.iLike]: `%${search}%` } }
                ];
            }

            if (year && month) {
                WhereClause.createdAt = {
                    [Op.between]: [
                        new Date(year, month - 1, 1),
                        new Date(year, month, 0, 23, 59, 59, 999)
                    ]
                };
            } else if (year) {
                WhereClause.createdAt = {
                    [Op.between]: [
                        new Date(year, 0, 1),
                        new Date(year, 11, 31, 23, 59, 59, 999)
                    ]
                };
            } else if (month) {
                const currentYear = new Date().getFullYear();
                WhereClause.createdAt = {
                    [Op.and]: [
                        { [Op.gte]: new Date(currentYear, month - 1, 1) },
                        { [Op.lte]: new Date(currentYear, month, 0, 23, 59, 59, 999) }
                    ]
                };
            }

            [history, totalCount] = await Promise.all([
                Layananformnum.findAll({
                    where: WhereClause,
                    include: [
                        {
                            model: Layanan,
                            attributes: { exclude: ['createdAt', 'updatedAt', "status", 'slug'] },
                            include: [{
                                model: Instansi,
                                attributes: { exclude: ['createdAt', 'updatedAt', "status", 'slug'] },
                            }],
                            where: WhereClause2,
                        },
                        {
                            model: Userinfo,
                            attributes: ['name', 'nik'],
                            where: WhereClause3,
                        },
                    ],
                    limit: limit,
                    offset: offset,
                    order: [['id', 'DESC']]
                }),
                Layananformnum.count({
                    where: WhereClause,
                    include: [
                        {
                            model: Layanan,
                            include: [{
                                model: Instansi
                            }],
                            where: WhereClause2,
                        },
                        {
                            model: Userinfo,
                            where: WhereClause3,
                        },
                    ],
                })
            ]);

            let formattedData = history.map(data => {
                return {
                    id: data.id,
                    userinfo_id: data?.userinfo_id,
                    name: data?.Userinfo?.name,
                    nik: data?.Userinfo?.nik,
                    status: data?.status,
                    tgl_selesai: data?.tgl_selesai,
                    isonline: data?.isonline,
                    layanan_id: data?.layanan_id,
                    layanan_name: data?.Layanan ? data?.Layanan?.name : null,
                    instansi_id: data?.Layanan && data?.Layanan?.Instansi ? data?.Layanan?.Instansi.id : null,
                    instansi_name: data?.Layanan && data?.Layanan?.Instansi ? data?.Layanan?.Instansi.name : null,
                    createdAt: data?.createdAt,
                    fileoutput: data?.fileoutput,
                    filesertif: data?.filesertif,
                    no_request: data?.no_request,
                };
            });

            const pagination = generatePagination(totalCount, page, limit, `/api/instansi/reportdocterbit`);

            res.status(200).json({
                status: 200,
                message: 'success get',
                data: formattedData,
                pagination: pagination
            });

        } catch (err) {
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

    pdfreportdokumen: async (req, res) => {
        try {
            const search = req.query.search ?? null;
            const isonline = req.query.isonline ?? null;
            let instansi_id = Number(req.query.instansi_id);
            let layanan_id = Number(req.query.layanan_id);
            const start_date = req.query.start_date;
            let end_date = req.query.end_date;
            const year = req.query.year ? parseInt(req.query.year) : null;
            const month = req.query.month ? parseInt(req.query.month) : null;

            let history;

            const WhereClause = {};
            const WhereClause2 = {};
            const WhereClause3 = {};

            if (data.role === 'Admin Instansi' || data.role === 'Admin Verifikasi' || data.role === 'Admin Layanan') {
                instansi_id = data.instansi_id;
            }

            if (data.role === 'Admin Layanan') {
                layanan_id = data.layanan_id;
            }

            if (isonline) {
                WhereClause.isonline = isonline;
            }

            WhereClause.status = 3;

            if (layanan_id) {
                WhereClause.layanan_id = layanan_id;
            }

            if (start_date && end_date) {
                end_date = new Date(end_date);
                end_date.setHours(23, 59, 59, 999);
                WhereClause.createdAt = {
                    [Op.between]: [new Date(start_date), new Date(end_date)]
                };
            } else if (start_date) {
                WhereClause.createdAt = {
                    [Op.gte]: new Date(start_date)
                };
            } else if (end_date) {
                end_date = new Date(end_date);
                end_date.setHours(23, 59, 59, 999);
                WhereClause.createdAt = {
                    [Op.lte]: new Date(end_date)
                };
            }

            if (instansi_id && data.role === 'Super Admin') {
                WhereClause2.instansi_id = instansi_id;
            }

            if (search) {
                WhereClause3[Op.or] = [
                    { name: { [Op.iLike]: `%${search}%` } },
                    { '$Layanan.name$': { [Op.iLike]: `%${search}%` } },
                    { '$Layanan->Instansi.name$': { [Op.iLike]: `%${search}%` } }
                ];
            }

            if (year && month) {
                WhereClause.createdAt = {
                    [Op.between]: [
                        new Date(year, month - 1, 1),
                        new Date(year, month, 0, 23, 59, 59, 999)
                    ]
                };
            } else if (year) {
                WhereClause.createdAt = {
                    [Op.between]: [
                        new Date(year, 0, 1),
                        new Date(year, 11, 31, 23, 59, 59, 999)
                    ]
                };
            } else if (month) {
                // Hanya bulan ditentukan
                const currentYear = new Date().getFullYear();
                WhereClause.createdAt = {
                    [Op.and]: [
                        { [Op.gte]: new Date(currentYear, month - 1, 1) },
                        { [Op.lte]: new Date(currentYear, month, 0, 23, 59, 59, 999) }
                    ]
                };
            }

            history = await Promise.all([
                Layananformnum.findAll({
                    where: WhereClause,
                    include: [
                        {
                            model: Layanan,
                            attributes: { exclude: ['createdAt', 'updatedAt', "status", 'slug'] },
                            include: [{
                                model: Instansi,
                                attributes: { exclude: ['createdAt', 'updatedAt', "status", 'slug'] },
                            }],
                            where: WhereClause2,
                        },
                        {
                            model: Userinfo,
                            attributes: ['name', 'nik'],
                            where: WhereClause3,
                        }
                    ],
                    order: [['id', 'DESC']]
                })
            ]);

            let formattedData = history[0].map(data => {
                return {
                    id: data.id,
                    userinfo_id: data?.userinfo_id,
                    name: data?.Userinfo?.name,
                    nik: data?.Userinfo?.nik,
                    pesan: data?.pesan,
                    status: data?.status,
                    tgl_selesai: data?.tgl_selesai,
                    isonline: data?.isonline,
                    layanan_id: data?.layanan_id,
                    layanan_name: data?.Layanan ? data?.Layanan?.name : null,
                    instansi_id: data?.Layanan && data?.Layanan?.Instansi ? data?.Layanan?.Instansi.id : null,
                    instansi_name: data?.Layanan && data?.Layanan?.Instansi ? data?.Layanan?.Instansi.name : null,
                    createdAt: data?.createdAt,
                    updatedAt: data?.updatedAt,
                    fileoutput: data?.fileoutput,
                    filesertif: data?.filesertif,
                    no_request: data?.no_request,
                };
            });

            // Generate HTML content for PDF
            const templatePath = path.resolve(__dirname, '../views/laporandokumenterbit.html');
            let htmlContent = fs.readFileSync(templatePath, 'utf8');
            let layananGet, instansiGet;

            if (layanan_id) {
                layananGet = await Layanan.findOne({
                    where: {
                        id: layanan_id
                    },
                });
            }

            if (instansi_id) {
                instansiGet = await Instansi.findOne({
                    where: {
                        id: instansi_id
                    },
                });
            }

            const instansiInfo = instansiGet?.name ? `<p>Instansi : ${instansiGet?.name}</p>` : '';
            const layananInfo = layananGet?.name ? `<p>Layanan : ${layananGet?.name}</p>` : '';
            let tanggalInfo = '';
            if (start_date || end_date) {
                const startDateFormatted = start_date ? new Date(start_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
                const endDateFormatted = end_date ? new Date(end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
                tanggalInfo = `<p>Periode Tanggal : ${startDateFormatted} s.d. ${endDateFormatted ? endDateFormatted : 'Hari ini'} </p>`;
            }

            const reportTableRows = formattedData?.map(permohonan => {
                const createdAtDate = new Date(permohonan.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
                const createdAtTime = new Date(permohonan.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

                const fileOutputLink = permohonan.fileoutput
                    ? `<a href="${permohonan.fileoutput}">Link</a>`
                    : 'Tidak ada file';

                const fileSertifLink = permohonan.filesertif
                    ? `<a href="${permohonan.filesertif}">Link</a>`
                    : 'Tidak ada file';

                return `
                    <tr>
                        <td class="center">${createdAtDate}</td>
                        <td class="center">${createdAtTime} WIB</td>
                        <td>${permohonan.nik}</td>
                        <td>${permohonan.name}</td>
                        <td>${permohonan.layanan_name}</td>
                        <td>${fileOutputLink}</td>
                        <td>${fileSertifLink}</td>
                    </tr>
                `;
            }).join('');

            htmlContent = htmlContent.replace('{{instansiInfo}}', instansiInfo);
            htmlContent = htmlContent.replace('{{layananInfo}}', layananInfo);
            htmlContent = htmlContent.replace('{{tanggalInfo}}', tanggalInfo);
            htmlContent = htmlContent.replace('{{reportTableRows}}', reportTableRows);

            // Launch Puppeteer
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();

            // Set HTML content
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

            // Generate PDF
            const pdfBuffer = await page.pdf({
                format: 'Legal',
                landscape: true,
                margin: {
                    top: '1.16in',
                    right: '1.16in',
                    bottom: '1.16in',
                    left: '1.16in'
                }
            });

            await browser.close();

            // Generate filename
            const currentDate = new Date().toISOString().replace(/:/g, '-');
            const filename = `laporan-${currentDate}.pdf`;

            // Send PDF buffer
            res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
            res.setHeader('Content-type', 'application/pdf');
            res.send(pdfBuffer);

        } catch (err) {
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

    reportpermasalahan: async (req, res) => {
        try {
            const instansi_id = req.query.instansi_id ?? null;
            const layanan_id = req.query.layanan_id ?? null;
            const admin_id = req.query.admin_id ?? null;
            let { start_date, end_date, search, status } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            let pengaduanGets;
            let totalCount;

            const whereCondition = {};

            if (instansi_id) {
                whereCondition.instansi_id = instansi_id;
            }

            if (admin_id) {
                whereCondition.admin_id = admin_id;
            }

            if (layanan_id) {
                whereCondition.layanan_id = layanan_id;
            }

            if (data.role === 'Admin Instansi' || data.role === 'Admin Verifikasi' || data.role === 'Admin Layanan') {
                whereCondition.instansi_id = data.instansi_id;
            }

            if (data.role === 'Admin Layanan') {
                whereCondition.layanan_id = data.layanan_id;
            }

            if (search) {
                whereCondition[Op.or] = [
                    { judul: { [Op.iLike]: `%${search}%` } },
                    { aduan: { [Op.iLike]: `%${search}%` } },
                    { '$Instansi.name$': { [Op.iLike]: `%${search}%` } },
                    { '$Instansi.name$': { [Op.iLike]: `%${search}%` } },
                    { '$Userinfo.name$': { [Op.iLike]: `%${search}%` } }
                ];
            }
            whereCondition.status = { [Op.ne]: 4 };

            if (start_date && end_date) {
                whereCondition.createdAt = {
                    [Op.between]: [moment(start_date).startOf('day').toDate(), moment(end_date).endOf('day').toDate()]
                };
            } else if (start_date) {
                whereCondition.createdAt = {
                    [Op.gte]: moment(start_date).startOf('day').toDate()
                };
            } else if (end_date) {
                whereCondition.createdAt = {
                    [Op.lte]: moment(end_date).endOf('day').toDate()
                };
            }

            [pengaduanGets, totalCount] = await Promise.all([
                Pengaduan.findAll({
                    where: whereCondition,
                    include: [
                        { model: Layanan, attributes: ['id', 'name'] },
                        { model: Instansi, attributes: ['id', 'name'] },
                        { model: Userinfo, attributes: ['id', 'name', 'nik'] },
                        { model: Userinfo, as: 'Admin', attributes: ['id', 'name', 'nik'] },
                        { model: Userinfo, as: 'Adminupdate', attributes: ['id', 'name', 'nik'] }
                    ],
                    limit: limit,
                    offset: offset,
                    order: [['id', 'DESC']]
                }),
                Pengaduan.count({
                    where: whereCondition,
                    include: [
                        { model: Layanan },
                        { model: Instansi },
                        { model: Userinfo }
                    ],
                })
            ]);

            const pagination = generatePagination(totalCount, page, limit, '/api/user/instansi/reportmasalah');

            res.status(200).json({
                status: 200,
                message: 'success get pengaduan',
                data: pengaduanGets,
                pagination: pagination
            });

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    pdfreportpermasalahan: async (req, res) => {
        try {

            let instansi_id = req.query.instansi_id ?? null;
            let layanan_id = req.query.layanan_id ?? null;
            let { start_date, end_date, search, status } = req.query;
            let pengaduanGets;

            const whereCondition = {};

            if (instansi_id) {
                whereCondition.instansi_id = instansi_id;
            }

            if (layanan_id) {
                whereCondition.layanan_id = layanan_id;
            }

            if (data.role === 'Admin Instansi' || data.role === 'Admin Verifikasi' || data.role === 'Admin Layanan') {
                instansi_id = data.instansi_id;
                whereCondition.instansi_id = data.instansi_id;
            }

            if (data.role === 'Admin Layanan') {
                layanan_id = data.layanan_id;
                whereCondition.layanan_id = data.layanan_id;
            }

            if (search) {
                whereCondition[Op.or] = [
                    { judul: { [Op.iLike]: `%${search}%` } },
                    { aduan: { [Op.iLike]: `%${search}%` } },
                    { '$Instansi.name$': { [Op.iLike]: `%${search}%` } },
                    { '$Layanan.name$': { [Op.iLike]: `%${search}%` } },
                    { '$Userinfo.name$': { [Op.iLike]: `%${search}%` } }
                ];
            }

            whereCondition.status = { [Op.ne]: 4 };

            if (start_date && end_date) {
                whereCondition.createdAt = {
                    [Op.between]: [moment(start_date).startOf('day').toDate(), moment(end_date).endOf('day').toDate()]
                };
            } else if (start_date) {
                whereCondition.createdAt = {
                    [Op.gte]: moment(start_date).startOf('day').toDate()
                };
            } else if (end_date) {
                whereCondition.createdAt = {
                    [Op.lte]: moment(end_date).endOf('day').toDate()
                };
            }

            pengaduanGets = await Promise.all([
                Pengaduan.findAll({
                    where: whereCondition,
                    include: [
                        { model: Layanan, attributes: ['id', 'name'] },
                        { model: Instansi, attributes: ['id', 'name'] },
                        { model: Userinfo, attributes: ['id', 'name', 'nik'] },
                        { model: Userinfo, as: 'Admin', attributes: ['id', 'name', 'nik'] },
                    ],
                    order: [['id', 'DESC']]
                })
            ]);

            // Generate HTML content for PDF
            const templatePath = path.resolve(__dirname, '../views/laporanpermalahan.html');
            let htmlContent = fs.readFileSync(templatePath, 'utf8');
            let instansiGet, pengaduanGet;

            if (instansi_id) {
                instansiGet = await Instansi.findOne({
                    where: {
                        id: instansi_id
                    },
                });
            }

            if (layanan_id) {
                pengaduanGet = await Layanan.findOne({
                    where: {
                        id: layanan_id
                    },
                });
            }

            const instansiInfo = instansiGet?.name ? `<p>Instansi : ${instansiGet?.name}</p>` : '';
            const layananInfo = pengaduanGet?.name ? `<p>Layanan : ${pengaduanGet?.name}</p>` : '';
            let tanggalInfo = '';
            if (start_date || end_date) {
                const startDateFormatted = start_date ? new Date(start_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
                const endDateFormatted = end_date ? new Date(end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
                tanggalInfo = `<p>Periode Tanggal : ${startDateFormatted} s.d. ${endDateFormatted ? endDateFormatted : 'Hari ini'} </p>`;
            }

            const reportTableRows = pengaduanGets[0]?.map(pengaduan => {
                const createdAtDate = new Date(pengaduan.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

                return `
                     <tr>
                         <td class="center">${createdAtDate}</td>
                         <td>${pengaduan?.Userinfo?.name}</td>
                         <td>${pengaduan?.Layanan?.name}</td>
                         <td>${pengaduan?.Admin?.name ? pengaduan?.Admin?.name : '-'}</td>
                         <td>${pengaduan?.judul}</td>
                         <td>${pengaduan?.aduan}</td>
                     </tr>
                 `;
            }).join('');

            htmlContent = htmlContent.replace('{{instansiInfo}}', instansiInfo);
            htmlContent = htmlContent.replace('{{layananInfo}}', layananInfo);
            htmlContent = htmlContent.replace('{{tanggalInfo}}', tanggalInfo);
            htmlContent = htmlContent.replace('{{reportTableRows}}', reportTableRows);

            // Launch Puppeteer
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();

            // Set HTML content
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

            // Generate PDF
            const pdfBuffer = await page.pdf({
                format: 'Legal',
                landscape: true,
                margin: {
                    top: '1.0in',
                    right: '1.0in',
                    bottom: '1.0in',
                    left: '1.0in'
                }
            });

            await browser.close();

            // Generate filename
            const currentDate = new Date().toISOString().replace(/:/g, '-');
            const filename = `laporan-${currentDate}.pdf`;

            // Send PDF buffer
            res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
            res.setHeader('Content-type', 'application/pdf');
            res.send(pdfBuffer);

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //SCREEN ANTRIAN
    getScreenAntrian: async (req, res) => {
        try {
            const instansi_id = data.instansi_id;

            const whereCondition = {
                instansi_id: instansi_id,
                status: true,
                deletedAt: null
            };

            let layananGets, antrian_last, count

            [layananGets, antrian_last, count] = await Promise.all([
                Layanan.findAll({
                    where: whereCondition,
                    attributes: ['id', 'name', 'code'],
                    order: [['id', 'ASC']],
                    include: [{
                        model: Antrian,
                        attributes: ['code'],
                        where: {
                            createdAt: { [Op.between]: [moment().startOf('day').toDate(), moment().endOf('day').toDate()] },
                            status: true,
                            finishedAt: { [Op.is]: null }
                        },
                        required: false
                    }],
                }),
                Antrian.findOne({
                    attributes: ['id', 'code', 'updatedAt'],
                    where: {
                        createdAt: { [Op.between]: [moment().startOf('day').toDate(), moment().endOf('day').toDate()] },
                        status: true,
                        finishedAt: { [Op.is]: null }
                    },
                    include: [{
                        model: Layanan,
                        attributes: ['name', 'code'],
                    }],
                    order: [['updatedAt', 'DESC']]
                }),
                Layanan.count({
                    where: whereCondition
                }),
            ]);

            // Transformasi data untuk mengubah struktur Antrians menjadi antrian_now
            const transformedData = layananGets?.map(layanan => ({
                name: layanan?.name,
                code: layanan?.code,
                antrian_now: layanan?.Antrians?.length > 0 ? layanan?.Antrians[0]?.code : '-'
            }));

            let transformedData2
            if (antrian_last) {
                transformedData2 = {
                    name: antrian_last?.Layanan?.name ?? '-',
                    code: antrian_last?.Layanan?.code ?? '-',
                    antrian_now: antrian_last.code ?? '-'
                };
            }

            res.status(200).json({
                status: 200,
                message: 'success get layanan by dinas',
                data: {
                    antrian: transformedData,
                    antrian_last: transformedData2,
                    count: count
                },
            });

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

}