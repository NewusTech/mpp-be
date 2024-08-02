const { response } = require('../helpers/response.formatter');

const { Pengaduan, Layanan, Instansi, Userinfo } = require('../models');
const Validator = require("fastest-validator");
const v = new Validator();
const { generatePagination } = require('../pagination/pagination');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const moment = require('moment-timezone');
const nodemailer = require('nodemailer');
const { format } = require('date-fns');
const { id } = require('date-fns/locale');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_NAME,
        pass: process.env.EMAIL_PW,
    }
});

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

    //membuat pengaduan
    createpengaduan: async (req, res) => {
        try {

            //membuat schema untuk validasi
            const schema = {
                judul: { type: "string", min: 3 },
                instansi_id: { type: "number" },
                layanan_id: { type: "number" },
                status: { type: "number" },
                aduan: { type: "string", min: 3, optional: true },
                jawaban: { type: "string", optional: true },
                image: {
                    type: "string",
                    optional: true
                },
            }

            const userinfo_id = data.role === "User" ? data.userId : null;

            if (req.file) {
                const timestamp = new Date().getTime();
                const uniqueFileName = `${timestamp}-${req.file.originalname}`;

                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `${process.env.PATH_AWS}/pengaduan/${uniqueFileName}`,
                    Body: req.file.buffer,
                    ACL: 'public-read',
                    ContentType: req.file.mimetype
                };

                const command = new PutObjectCommand(uploadParams);

                await s3Client.send(command);

                imageKey = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
            }

            //buat object pengaduan
            let pengaduanCreateObj = {
                judul: req.body.judul,
                aduan: req.body.aduan,
                instansi_id: Number(req.body.instansi_id),
                layanan_id: Number(req.body.layanan_id),
                status: Number(req.body.status),
                jawaban: req.body.jawaban,
                userinfo_id: userinfo_id ?? null,
                image: req.file ? imageKey : undefined,
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(pengaduanCreateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //buat pengaduan
            let pengaduanCreate = await Pengaduan.create(pengaduanCreateObj);

            //response menggunakan helper response.formatter
            res.status(201).json(response(201, 'success create pengaduan', pengaduanCreate));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan semua data pengaduan
    getpengaduan: async (req, res) => {
        try {
            const userinfo_id = data.role === "User" ? data.userId : null;

            const instansi_id = req.query.instansi_id ?? null;
            const layanan_id = req.query.layanan_id ?? null;
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
                    { '$Layanan.name$': { [Op.iLike]: `%${search}%` } }
                ];
            }
            if (status) {
                whereCondition.status = status;
            }
            if (userinfo_id) {
                whereCondition.userinfo_id = userinfo_id;
            }
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
                        { model: Userinfo, attributes: ['id', 'name', 'nik'] }
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

            const pagination = generatePagination(totalCount, page, limit, '/api/user/pengaduan/get');

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

    pdfpengaduan: async (req, res) => {
        try {
            const userinfo_id = data.role === "User" ? data.userId : null;

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
                    { '$Layanan.name$': { [Op.iLike]: `%${search}%` } }
                ];
            }
            if (status) {
                whereCondition.status = status;
            }
            if (userinfo_id) {
                whereCondition.userinfo_id = userinfo_id;
            }
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
                        { model: Userinfo, attributes: ['id', 'name', 'nik'] }
                    ],
                    order: [['id', 'DESC']]
                })
            ]);

            // Generate HTML content for PDF
            const templatePath = path.resolve(__dirname, '../views/pengaduan.html');
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
                const createdAtDate = new Date(pengaduan.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

                return `
                     <tr>
                         <td class="center">${createdAtDate}</td>
                         <td>${pengaduan?.Layanan?.name}</td>
                         <td>${pengaduan?.Userinfo?.name}</td>
                         <td>${pengaduan?.judul}</td>
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
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan data pengaduan berdasarkan id
    getpengaduanById: async (req, res) => {
        try {
            //mendapatkan data pengaduan berdasarkan id
            let pengaduanGet = await Pengaduan.findOne({
                where: {
                    id: req.params.id
                },
                include: [
                    { model: Layanan, attributes: ['id', 'name'] },
                    { model: Instansi, attributes: ['id', 'name'] },
                    { model: Userinfo, attributes: ['id', 'name', 'nik'] }
                ],
            });

            //cek jika pengaduan tidak ada
            if (!pengaduanGet) {
                res.status(404).json(response(404, 'pengaduan not found'));
                return;
            }

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get pengaduan by id', pengaduanGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mengupdate pengaduan berdasarkan id
    updatepengaduan: async (req, res) => {
        try {
            //mendapatkan data pengaduan untuk pengecekan
            let pengaduanGet = await Pengaduan.findOne({
                where: {
                    id: req.params.id
                }, 
                include: [
                    {
                        model: Userinfo,
                        attributes: ['email', 'name'],
                    },
                    {
                        model: Layanan,
                        attributes: ['name'],
                    },
                    {
                        model: Instansi,
                        attributes: ['name', 'email', 'telp'],
                    }
                ],
            })

            //cek apakah data pengaduan ada
            if (!pengaduanGet) {
                res.status(404).json(response(404, 'pengaduan not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                status: { type: "number", optional: true },
                jawaban: { type: "string", optional: true }
            }

            //buat object pengaduan
            let pengaduanUpdateObj = {
                status: Number(req.body.status),
                jawaban: req.body.jawaban,
            }

            const sendEmailNotification = (subject, text) => {
                const mailOptions = {
                    to: pengaduanGet?.Userinfo?.email,
                    from: process.env.EMAIL_NAME,
                    subject,
                    text
                };
                transporter.sendMail(mailOptions, (err) => {
                    if (err) {
                        console.error('There was an error: ', err);
                        return res.status(500).json({ message: 'Error sending the email.' });
                    }
                    res.status(200).json({ message: 'An email has been sent with further instructions.' });
                });
            };

            if (pengaduanUpdateObj.status) {
                const formattedDate = format(new Date(pengaduanGet?.createdAt), "EEEE, dd MMMM yyyy (HH.mm 'WIB')", { locale: id });
                let subject, text;
                if (pengaduanUpdateObj.status) {
                    subject = 'Pengaduan Direspon';
                    text = `Yth. ${pengaduanGet?.Userinfo?.name},\nKami ingin memberitahukan bahwa pengaduan anda telah direspon.\n\nDetail pengaduan anda adalah sebagai berikut:\n\t- Dinas = ${pengaduanGet?.Instansi?.name}\n\t- Layanan = ${pengaduanGet?.Layanan?.name}\n\t- Tanggal Pengaduan = ${formattedDate}\n\t- Judul pengaduan = ${pengaduanGet?.judul}\n\t- Detail pengaduan = ${pengaduanGet?.aduan}\n\t- Respon / Jawaban = ${pengaduanUpdateObj?.jawaban}\n\n. Jika Anda membutuhkan informasi lebih lanjut, jangan ragu untuk menghubungi kami melalui kontak dibawah ini.\n\t- Email = ${pengaduanGet?.Instansi?.email}\n\t- Nomor = ${pengaduanGet?.Instansi?.telp}\n\nTerima kasih atas kepercayaan Anda menggunakan layanan kami.\n\nSalam hormat,\n${pengaduanGet?.Instansi?.name}`;
                    pengaduanUpdateObj.tgl_selesai = Date.now();
                }

                if (pengaduanGet?.Userinfo?.email) {
                    sendEmailNotification(subject, text);
                }
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(pengaduanUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update pengaduan
            await Pengaduan.update(pengaduanUpdateObj, {
                where: {
                    id: req.params.id,
                }
            })

            //mendapatkan data pengaduan setelah update
            let pengaduanAfterUpdate = await Pengaduan.findOne({
                where: {
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update pengaduan', pengaduanAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //menghapus pengaduan berdasarkan id
    deletepengaduan: async (req, res) => {
        try {

            //mendapatkan data pengaduan untuk pengecekan
            let pengaduanGet = await Pengaduan.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data pengaduan ada
            if (!pengaduanGet) {
                res.status(404).json(response(404, 'pengaduan not found'));
                return;
            }

            await Pengaduan.destroy({
                where: {
                    id: req.params.id,
                }
            })

            res.status(200).json(response(200, 'success delete pengaduan'));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    }
}