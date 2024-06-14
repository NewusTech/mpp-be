const { response } = require('../helpers/response.formatter');

const { User, Userinfo, Role, Instansi, sequelize } = require('../models');

const passwordHash = require('password-hash');
const Validator = require("fastest-validator");
const v = new Validator();
const { Op } = require('sequelize');
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

    //mendapatkan semua data user
    //UTK ADMIN NGECEK DATA PEMOHON
    getuserdata: async (req, res) => {
        try {
            const search = req.query.search ?? null;
            const role = req.query.role ?? null;
            const instansi = req.query.instansi ?? null;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            let userGets;
            let totalCount;

            const userWhereClause = {};
            if (role) {
                userWhereClause.role_id = role;
            }
            if (instansi) {
                userWhereClause.instansi_id = instansi;
            }

            if (search) {
                [userGets, totalCount] = await Promise.all([
                    Userinfo.findAll({
                        where: {
                            [Op.or]: [
                                { nik: { [Op.iLike]: `%${search}%` } },
                                { name: { [Op.iLike]: `%${search}%` } }
                            ]
                        },
                        include: [{
                            model: User,
                            where: userWhereClause,
                            attributes: ['id'],
                            include: [
                                {
                                    model: Role,
                                    attributes: ['id', 'name'],
                                },
                                {
                                    model: Instansi,
                                    attributes: ['id', 'name'],
                                }
                            ],
                        }],
                        limit: limit,
                        offset: offset
                    }),
                    Userinfo.count({
                        where: {
                            [Op.or]: [
                                { nik: { [Op.iLike]: `%${search}%` } },
                                { name: { [Op.iLike]: `%${search}%` } }
                            ]
                        }
                    })
                ]);
            } else {
                [userGets, totalCount] = await Promise.all([
                    Userinfo.findAll({
                        limit: limit,
                        offset: offset,
                        include: [{
                            model: User,
                            where: userWhereClause,
                            attributes: ['id'],
                            include: [
                                {
                                    model: Role,
                                    attributes: ['id', 'name'],
                                },
                                {
                                    model: Instansi,
                                    attributes: ['id', 'name'],
                                }
                            ],
                        }],
                    }),
                    Userinfo.count()
                ]);
            }

            const pagination = generatePagination(totalCount, page, limit, '/api/user/alluserinfo/get');

            const formattedData = userGets.map(user => {
                return {
                    id: user.id,
                    name: user.name,
                    nik: user.nik,
                    email: user.email,
                    telepon: user.telepon,
                    kec: user.kec,
                    desa: user.desa,
                    rt: user.rt,
                    rw: user.rw,
                    alamat: user.alamat,
                    agama: user.agama,
                    tempat_lahir: user.tempat_lahir,
                    tgl_lahir: user.tgl_lahir,
                    status_kawin: user.status_kawin,
                    gender: user.gender,
                    pekerjaan: user.pekerjaan,
                    goldar: user.goldar,
                    pendidikan: user.pendidikan,
                    filektp: user.filektp,
                    filekk: user.filekk,
                    fileijazahsd: user.fileijazahsd,
                    fileijazahsmp: user.fileijazahsmp,
                    fileijazahsma: user.fileijazahsma,
                    fileijazahlain: user.fileijazahlain,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    Role: user.User.Role ? user.User.Role.name : null,
                    Instansi: user.User.Instansi ? user.User.Instansi.name : null
                };
            });
            
            res.status(200).json({
                status: 200,
                message: 'success get user',
                data: formattedData,
                pagination: pagination
            });

        } catch (err) {
            res.status(500).json({
                status: 500,
                message: 'internal server error',
                error: err
            });
            console.log(err);
        }
    },

    //mendapatkan data user berdasarkan id
    //UTK ADMIN NGECEK DATA PEMOHON
    getuserById: async (req, res) => {
        try {
            let userGet = await Userinfo.findOne({
                where: {
                    id: req.params.id
                },
            });

            if (!userGet) {
                res.status(404).json(response(404, 'user data not found'));
                return;
            }

            res.status(200).json(response(200, 'success get user by id', userGet));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //create data person
    //dari sisi admin, jika user offline belum punya akun
    createuserinfo: async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const folderPaths = {
                filektp: "mpp/datauser/filektp",
                filekk: "mpp/datauser/filekk",
                fileijazahsd: "mpp/datauser/fileijazahsd",
                fileijazahsmp: "mpp/datauser/fileijazahsmp",
                fileijazahsma: "mpp/datauser/fileijazahsma",
                fileijazahlain: "mpp/datauser/fileijazahlain",
            };

            //membuat schema untuk validasi
            const schema = {
                name: { type: "string", min: 2 },
                nik: { type: "string", length: 16 },
                email: { type: "string", min: 5, max: 25, pattern: /^\S+@\S+\.\S+$/, optional: true },
                telepon: { type: "string", min: 7, max: 15, optional: true },
                kec: { type: "string", min: 1, optional: true },
                desa: { type: "string", min: 1, optional: true },
                rt: { type: "string", min: 1, optional: true },
                rw: { type: "string", min: 1, optional: true },
                alamat: { type: "string", min: 3, optional: true },
                agama: { type: "number", optional: true },
                tempat_lahir: { type: "string", min: 2, optional: true },
                tgl_lahir: { type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/, optional: true },
                status_kawin: { type: "number", optional: true },
                gender: { type: "number", optional: true },
                pekerjaan: { type: "string", optional: true },
                goldar: { type: "number", optional: true },
                pendidikan: { type: "number", optional: true },
                fileijazahsd: { type: "string", optional: true },
                fileijazahsmp: { type: "string", optional: true },
                fileijazahsma: { type: "string", optional: true },
                fileijazahlain: { type: "string", optional: true },
            }

            //buat object userinfo
            let userinfoObj = {
                name: req.body.name,
                nik: req.body.nik,
                email: req.body.email,
                telepon: req.body.telepon,
                kec: req.body.kec,
                desa: req.body.desa,
                rt: req.body.rt,
                rw: req.body.rw,
                alamat: req.body.alamat,
                agama: req.body.agama ? Number(req.body.agama) : null,
                tempat_lahir: req.body.tempat_lahir,
                tgl_lahir: req.body.tgl_lahir,
                status_kawin: req.body.status_kawin ? Number(req.body.status_kawin) : null,
                gender: req.body.gender ? Number(req.body.gender) : null,
                pekerjaan: req.body.pekerjaan,
                goldar: req.body.goldar ? Number(req.body.goldar) : null,
                pendidikan: req.body.pendidikan ? Number(req.body.pendidikan) : null,
            };

            // Process image upload
            const files = req.files;
            let imageUrls = {};

            for (const key in files) {
                if (files[key] && files[key][0]) {
                    const file = files[key][0];
                    const { mimetype, buffer, originalname } = file;
                    const base64 = Buffer.from(buffer).toString('base64');
                    const dataURI = `data:${mimetype};base64,${base64}`;

                    const now = new Date();
                    const timestamp = now.toISOString().replace(/[-:.]/g, '');
                    const uniqueFilename = `${originalname.split('.')[0]}_${timestamp}`;

                    const uploadParams = {
                        Bucket: process.env.AWS_S3_BUCKET,
                        Key: `${folderPaths[key]}/${uniqueFilename}`,
                        Body: buffer,
                        ACL: 'public-read',
                        ContentType: mimetype
                    };

                    const command = new PutObjectCommand(uploadParams);
                    await s3Client.send(command);

                    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;

                    imageUrls[key] = fileUrl;
                    // Menambahkan URL gambar ke objek userinfo
                    userinfoObj[key] = fileUrl;
                }
            }

            // Cek apakah nik sudah terdaftar di tabel userinfos
            let userinfoGets = await Userinfo.findOne({
                where: {
                    nik: req.body.nik
                }
            });

            // Cek apakah nik sudah terdaftar
            if (userinfoGets) {
                res.status(409).json(response(409, 'nik already registered'));
                return;
            }

            //validasi menggunakan module fastest-validator
            const validate = v.validate(userinfoObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update userinfo
            let userinfoCreate = await Userinfo.create(userinfoObj)

            const firstName = req.body.name.split(' ')[0].toLowerCase();
            const generatedPassword = firstName + "123";

            // Membuat object untuk create user
            let userCreateObj = {
                password: passwordHash.generate(generatedPassword),
                role_id: 3,
                userinfo_id: userinfoCreate.id
            };

            // Membuat user baru
            await User.create(userCreateObj);

            //response menggunakan helper response.formatter
            await transaction.commit();
            res.status(200).json(response(200, 'success create userinfo', userinfoCreate));

        } catch (err) {
            await transaction.rollback();
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //update data person
    //user update sendiri
    updateuserinfo: async (req, res) => {
        try {
            //mendapatkan data userinfo untuk pengecekan
            let userinfoGet = await Userinfo.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data userinfo ada
            if (!userinfoGet) {
                res.status(404).json(response(404, 'userinfo not found'));
                return;
            }

            //membuat schema untuk validasi
            const schema = {
                name: { type: "string", min: 2 },
                nik: { type: "string", length: 16, optional: true },
                email: { type: "string", min: 5, max: 25, pattern: /^\S+@\S+\.\S+$/, optional: true },
                telepon: { type: "string", min: 7, max: 15, optional: true },
                kec: { type: "string", min: 1, optional: true },
                desa: { type: "string", min: 1, optional: true },
                rt: { type: "string", min: 1, optional: true },
                rw: { type: "string", min: 1, optional: true },
                alamat: { type: "string", min: 3, optional: true },
                agama: { type: "number", optional: true },
                tempat_lahir: { type: "string", min: 2, optional: true },
                tgl_lahir: { type: "string", pattern: /^\d{4}-\d{2}-\d{2}$/, optional: true },
                status_kawin: { type: "number", optional: true },
                gender: { type: "number", optional: true },
                pekerjaan: { type: "string", optional: true },
                goldar: { type: "number", optional: true },
                pendidikan: { type: "number", optional: true },
            }

            //buat object userinfo
            let userinfoUpdateObj = {
                name: req.body.name,
                nik: req.body.nik,
                email: req.body.email,
                telepon: req.body.telepon,
                kec: req.body.kec,
                desa: req.body.desa,
                rt: req.body.rt,
                rw: req.body.rw,
                alamat: req.body.alamat,
                agama: req.body.agama ? Number(req.body.agama) : null,
                tempat_lahir: req.body.tempat_lahir,
                tgl_lahir: req.body.tgl_lahir,
                status_kawin: req.body.status_kawin ? Number(req.body.status_kawin) : null,
                gender: req.body.gender ? Number(req.body.gender) : null,
                pekerjaan: req.body.pekerjaan,
                goldar: req.body.goldar ? Number(req.body.goldar): null, 
                pendidikan: req.body.pendidikan? Number(req.body.pendidikan) : null,
            };

            //validasi menggunakan module fastest-validator
            const validate = v.validate(userinfoUpdateObj, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //update userinfo
            await Userinfo.update(userinfoUpdateObj, {
                where: {
                    id: req.params.id,
                }
            })

            //mendapatkan data userinfo setelah update
            let userinfoAfterUpdate = await Userinfo.findOne({
                where: {
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update userinfo', userinfoAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //update data person
    //user update sendiri
    updateuserdocs: async (req, res) => {
        try {
            const folderPaths = {
                filektp: "mpp/datauser/filektp",
                filekk: "mpp/datauser/filekk",
                fileijazahsd: "mpp/datauser/fileijazahsd",
                fileijazahsmp: "mpp/datauser/fileijazahsmp",
                fileijazahsma: "mpp/datauser/fileijazahsma",
                fileijazahlain: "mpp/datauser/fileijazahlain",
            };

            //mendapatkan data userinfo untuk pengecekan
            let userinfoGet = await Userinfo.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data userinfo ada
            if (!userinfoGet) {
                res.status(404).json(response(404, 'userinfo not found'));
                return;
            }

            const oldImageUrls = {
                filektp: userinfoGet.filektp,
                filekk: userinfoGet.filekk,
                fileijazahsd: userinfoGet.fileijazahsd,
                fileijazahsmp: userinfoGet.fileijazahsmp,
                fileijazahsma: userinfoGet.fileijazahsma,
                fileijazahlain: userinfoGet.fileijazahlain,
            };

            //membuat schema untuk validasi
            const schema = {
                filektp: { type: "string" },
                filekk: { type: "string", optional: true },
                fileijazahsd: { type: "string", optional: true },
                fileijazahsmp: { type: "string", optional: true },
                fileijazahsma: { type: "string", optional: true },
                fileijazahlain: { type: "string", optional: true },
            }

            const files = req.files;
            let uploadResults = {};

            for (const key in files) {
                if (files[key] && files[key][0]) {

                    const file = files[key][0];
                    const { mimetype, buffer, originalname } = file;
                    const base64 = Buffer.from(buffer).toString('base64');
                    const dataURI = `data:${mimetype};base64,${base64}`;

                    const now = new Date();
                    const timestamp = now.toISOString().replace(/[-:.]/g, '');
                    const uniqueFilename = `${originalname.split('.')[0]}_${timestamp}`;

                    const uploadParams = {
                        Bucket: process.env.AWS_S3_BUCKET,
                        Key: `${folderPaths[key]}/${uniqueFilename}`,
                        Body: buffer,
                        ACL: 'public-read',
                        ContentType: mimetype
                    };

                    const command = new PutObjectCommand(uploadParams);
                    await s3Client.send(command);

                    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;

                    uploadResults[key] = fileUrl;
                }
            }

            let userinfoUpdateObj = {};

            for (const key in folderPaths) {
                if (uploadResults[key]) {
                    userinfoUpdateObj[key] = uploadResults[key];
                } else {
                    // Jika file tidak diperbarui, gunakan URL lama
                    userinfoUpdateObj[key] = oldImageUrls[key];
                }
            }

            //update userinfo
            await Userinfo.update(userinfoUpdateObj, {
                where: {
                    id: req.params.id,
                }
            })

            //mendapatkan data userinfo setelah update
            let userinfoAfterUpdate = await Userinfo.findOne({
                where: {
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success update userinfo', userinfoAfterUpdate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //menghapus user berdasarkan id
    deleteuser: async (req, res) => {
        try {

            //mendapatkan data user untuk pengecekan
            let userinfoGet = await Userinfo.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data user ada
            if (!userinfoGet) {
                res.status(404).json(response(404, 'data not found'));
                return;
            }

            //mendapatkan data akun user
            let userGet = await User.findOne({
                where: {
                    userinfo_id: req.params.id
                }
            })

            //cek apakah data akun user ada
            //jika ada, tolak penghapusan
            if (userGet) {
                res.status(404).json(response(404, 'akun user masih aktif, tidak bisa menghapus data'));
                return;
            }

            const folderPaths = {
                filektp: "mpp/datauser/filektp",
                filekk: "mpp/datauser/filekk",
                fileijazahsd: "mpp/datauser/fileijazahsd",
                fileijazahsmp: "mpp/datauser/fileijazahsmp",
                fileijazahsma: "mpp/datauser/fileijazahsma",
                fileijazahlain: "mpp/datauser/fileijazahlain",
            };

            const oldImageUrls = {
                filektp: userinfoGet.filektp,
                filekk: userinfoGet.filekk,
                fileijazahsd: userinfoGet.fileijazahsd,
                fileijazahsmp: userinfoGet.fileijazahsmp,
                fileijazahsma: userinfoGet.fileijazahsma,
                fileijazahlain: userinfoGet.fileijazahlain,
            };

            await Userinfo.destroy({
                where: {
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success delete user'));

        } catch (err) {
            if (err.name === 'SequelizeForeignKeyConstraintError') {
                res.status(400).json(response(400, 'Data tidak bisa dihapus karena masih digunakan pada tabel lain'));
            } else {
                res.status(500).json(response(500, 'Internal server error', err));
                console.log(err);
            }
        }
    },

}