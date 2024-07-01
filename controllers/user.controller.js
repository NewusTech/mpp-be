const { response } = require('../helpers/response.formatter');

const { User, Token, Instansi, Role, Userinfo, Kecamatan, Desa, sequelize } = require('../models');
const baseConfig = require('../config/base.config');
const passwordHash = require('password-hash');
const jwt = require('jsonwebtoken');
const { generatePagination } = require('../pagination/pagination');
const Validator = require("fastest-validator");
const v = new Validator();
const { Op } = require('sequelize');

module.exports = {

    //membuat user baru
    createUser: async (req, res) => {
        const transaction = await sequelize.transaction();

        try {

            // Membuat schema untuk validasi
            const schema = {
                name: { type: "string", min: 3 },
                nik: { type: "string", min: 3 },
                email: { type: "string", min: 5, max: 50, pattern: /^\S+@\S+\.\S+$/, optional: true },
                telepon: { type: "string", min: 7, max: 15, optional: true },
                password: { type: "string", min: 3 },
                instansi_id: { type: "number", optional: true },
                role_id: { type: "number", optional: true },
                kecamatan_id: { type: "string", min: 1, optional: true },
                desa_id: { type: "string", min: 1, optional: true },
                rt: { type: "string", min: 1, optional: true },
                rw: { type: "string", min: 1, optional: true },
                alamat: { type: "string", min: 3, optional: true },
            };

            // Validasi
            const validate = v.validate({
                name: req.body.name,
                nik: req.body.nik,
                password: req.body.password,
                instansi_id: req.body.instansi_id !== undefined ? Number(req.body.instansi_id) : undefined,
                role_id: req.body.role_id !== undefined ? Number(req.body.role_id) : undefined,
                email: req.body.email,
                telepon: req.body.telepon,
                kecamatan_id: req.body.kecamatan_id,
                desa_id: req.body.desa_id,
                rt: req.body.rt,
                rw: req.body.rw,
                alamat: req.body.alamat
            }, schema);

            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
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

            const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
            const slug = `${req.body.name}-${timestamp}`;

            // Membuat object untuk create userinfo
            let userinfoCreateObj = {
                name: req.body.name,
                nik: req.body.nik,
                email: req.body.email,
                telepon: req.body.telepon,
                kecamatan_id: req.body.kecamatan_id,
                desa_id: req.body.desa_id,
                rt: req.body.rt,
                rw: req.body.rw,
                alamat: req.body.alamat,
                slug: slug
            };

            // Membuat entri baru di tabel userinfo
            let userinfoCreate = await Userinfo.create(userinfoCreateObj);

            // Membuat object untuk create user
            let userCreateObj = {
                password: passwordHash.generate(req.body.password),
                instansi_id: req.body.instansi_id !== undefined ? Number(req.body.instansi_id) : undefined,
                role_id: req.body.role_id !== undefined ? Number(req.body.role_id) : undefined,
                userinfo_id: userinfoCreate.id,
                slug: slug
            };

            // Membuat user baru
            let userCreate = await User.create(userCreateObj);

            // Mengirim response dengan bantuan helper response.formatter
            await transaction.commit();
            res.status(201).json(response(201, 'user created', userCreate));

        } catch (err) {
            await transaction.rollback();
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //login user
    loginUser: async (req, res) => {
        try {
            const schema = {
                nik: {
                    type: "string",
                    min: 3,
                },
                password: {
                    type: "string",
                    min: 3,
                }
            };

            let nik = req.body.nik;
            let password = req.body.password;

            const validate = v.validate({
                nik: nik,
                password: password,
            }, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            // mendapatkan data user 
            let userinfo = await Userinfo.findOne({
                where: {
                    nik: nik,
                },
                attributes: ['nik', 'id'],
                include: [
                    {
                        model: User,
                        attributes: ['password', 'id', 'role_id'],
                        include: [
                            {
                                model: Role,
                                attributes: ['id', 'name']
                            },
                            {
                                model: Instansi,
                                attributes: ['id', 'name']
                            }
                        ],
                        where: {
                            deletedAt: null
                        }
                    },
                ],
            });

            // cek nik
            if (!userinfo) {
                res.status(404).json(response(404, 'nik not found'));
                return;
            }

            // check password
            if (!passwordHash.verify(password, userinfo.User.password)) {
                res.status(403).json(response(403, 'password wrong'));
                return;
            }

            // membuat token jwt
            let token = jwt.sign({
                userId: userinfo.id,
                user_akun_id: userinfo.User.id,
                nik: userinfo.nik,
                role: userinfo.User.Role.name,
                instansi: userinfo?.User?.Instansi?.name ?? undefined,
                instansi_id: userinfo?.User?.Instansi?.id ?? undefined
            }, baseConfig.auth_secret, { // auth secret
                expiresIn: 864000 // expired 24 jam
            });

            res.status(200).json(response(200, 'login success', { token: token }));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //logout user
    logoutUser: async (req, res) => {
        try {
            //memasukan token kedalam variable
            let token = req.headers.authorization.split(' ')[1];

            //memasukan token ke table token
            let tokenInsert = await Token.create({
                token: token
            });

            //send response
            res.status(200).json(response(200, 'logout success', tokenInsert));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan semua data user
    getuser: async (req, res) => {
        try {
            const showDeleted = req.query.showDeleted ?? null;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            let userGets;
            let totalCount;

            const whereCondition = {};

            if (showDeleted !== null) {
                whereCondition.deletedAt = { [Op.not]: null };
            } else {
                whereCondition.deletedAt = null;
            }

            [userGets, totalCount] = await Promise.all([
                User.findAll({
                    include: [
                        {
                            model: Instansi,
                            attributes: ['name', 'id'],
                            as: 'Instansi'
                        },
                        {
                            model: Role,
                            attributes: ['name', 'id'],
                            as: 'Role'
                        },
                        {
                            model: Userinfo,
                            as: 'Userinfo',
                            include: [
                                {
                                    model: Kecamatan,
                                    attributes: ['name', 'id'],
                                    as: 'Kecamatan'
                                },
                                {
                                    model: Desa,
                                    attributes: ['name', 'id'],
                                    as: 'Desa'
                                }
                            ]
                        },
                    ],
                    limit: limit,
                    offset: offset,
                    attributes: { exclude: ['Instansi', 'Role', 'Userinfo'] },
                    order: [['id', 'ASC']],
                    where: whereCondition,
                }),
                User.count({
                    where: whereCondition
                })
            ]);

            let formattedUsers = userGets.map(user => {
                return {
                    id: user.id,
                    slug: user.slug,
                    name: user.Userinfo?.name,
                    nik: user.Userinfo?.nik,
                    instansi_id: user.Instansi?.id,
                    instansi_name: user.Instansi?.name,
                    role_id: user.Role?.id,
                    role_name: user.Role?.name,
                    kecamatan_id: user.Userinfo?.Kecamatan?.id,
                    kecamatan_name: user.Userinfo?.Kecamatan?.name,
                    desa_id: user.Userinfo?.Desa?.id,
                    desa_name: user.Userinfo?.Desa?.name,
                    nik: user.Userinfo?.nik,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                };
            });

            const pagination = generatePagination(totalCount, page, limit, '/api/user/alluser/get');

            res.status(200).json({
                status: 200,
                message: 'success get',
                data: formattedUsers,
                pagination: pagination
            });

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan data user berdasarkan slug
    getuserByslug: async (req, res) => {
        try {
            const showDeleted = req.query.showDeleted ?? null;
            const whereCondition = { slug: req.params.slug };

            if (showDeleted !== null) {
                whereCondition.deletedAt = { [Op.not]: null };
            } else {
                whereCondition.deletedAt = null;
            }

            let userGet = await User.findOne({
                where: whereCondition,
                include: [
                    {
                        model: Instansi,
                        attributes: ['name', 'id'],
                        as: 'Instansi'
                    },
                    {
                        model: Role,
                        attributes: ['name', 'id'],
                        as: 'Role'
                    },
                    {
                        model: Userinfo,
                        as: 'Userinfo',
                        include: [
                            {
                                model: Kecamatan,
                                attributes: ['name', 'id'],
                                as: 'Kecamatan'
                            },
                            {
                                model: Desa,
                                attributes: ['name', 'id'],
                                as: 'Desa'
                            }
                        ]
                    },
                ],
                attributes: { exclude: ['Instansi', 'Role', 'Userinfo'] }
            });

            //cek jika user tidak ada
            if (!userGet) {
                res.status(404).json(response(404, 'user not found'));
                return;
            }

            let formattedUsers = {
                id: userGet.id,
                name: userGet.Userinfo?.name,
                nik: userGet.Userinfo?.nik,
                instansi_id: userGet.Instansi?.id,
                instansi_title: userGet.Instansi?.name,
                role_id: userGet.Role?.id,
                role_name: userGet.Role?.name,
                kecamatan_id: userGet.Userinfo?.Kecamatan?.id,
                kecamatan_name: userGet.Userinfo?.Kecamatan?.name,
                desa_id: userGet.Userinfo?.Desa?.id,
                desa_name: userGet.Userinfo?.Desa?.name,
                createdAt: userGet.createdAt,
                updatedAt: userGet.updatedAt
            };

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get user by id', formattedUsers));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    getforuser: async (req, res) => {
        try {
            const showDeleted = req.query.showDeleted ?? null;
            const whereCondition = { id: data.userId };

            if (showDeleted !== null) {
                whereCondition.deletedAt = { [Op.not]: null };
            } else {
                whereCondition.deletedAt = null;
            }

            let userGet = await User.findOne({
                where: whereCondition,
                include: [
                    {
                        model: Instansi,
                        attributes: ['name', 'id'],
                        as: 'Instansi'
                    },
                    {
                        model: Role,
                        attributes: ['name', 'id'],
                        as: 'Role'
                    },
                    {
                        model: Userinfo,
                        as: 'Userinfo',
                        include: [
                            {
                                model: Kecamatan,
                                attributes: ['name', 'id'],
                                as: 'Kecamatan'
                            },
                            {
                                model: Desa,
                                attributes: ['name', 'id'],
                                as: 'Desa'
                            }
                        ]
                    },
                ],
                attributes: { exclude: ['Instansi', 'Role', 'Userinfo'] }
            });

            //cek jika user tidak ada
            if (!userGet) {
                res.status(404).json(response(404, 'user not found'));
                return;
            }

            let formattedUsers = {
                id: userGet.id,
                name: userGet.Userinfo?.name,
                slug: userGet.Userinfo?.slug,
                nik: userGet.Userinfo?.nik,
                email: userGet.Userinfo?.email,
                telepon: userGet.Userinfo?.telepon,
                kecamatan_id: userGet.Userinfo?.Kecamatan?.id,
                kecamatan_name: userGet.Userinfo?.Kecamatan?.name,
                desa_id: userGet.Userinfo?.Desa?.id,
                desa_name: userGet.Userinfo?.Desa?.name,
                rt: userGet.Userinfo?.rt,
                rw: userGet.Userinfo?.rw,
                alamat: userGet.Userinfo?.alamat,
                agama: userGet.Userinfo?.agama,
                tempat_lahir: userGet.Userinfo?.tempat_lahir,
                tgl_lahir: userGet.Userinfo?.tgl_lahir,
                status_kawin: userGet.Userinfo?.status_kawin,
                gender: userGet.Userinfo?.gender,
                pekerjaan: userGet.Userinfo?.pekerjaan,
                goldar: userGet.Userinfo?.goldar,
                pendidikan: userGet.Userinfo?.pendidikan,
                instansi_id: userGet.Instansi?.id,
                instansi_title: userGet.Instansi?.name,
                role_id: userGet.Role?.id,
                role_name: userGet.Role?.name,
                createdAt: userGet.createdAt,
                updatedAt: userGet.updatedAt
            };

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get user by id', formattedUsers));
        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //menghapus user berdasarkan slug
    deleteuser: async (req, res) => {

        try {

            //mendapatkan data user untuk pengecekan
            let userGet = await User.findOne({
                where: {
                    slug: req.params.slug,
                    deletedAt: null
                }
            })

            //cek apakah data user ada
            if (!userGet) {
                res.status(404).json(response(404, 'user not found'));
                return;
            }

            await User.update({ deletedAt: new Date() }, {
                where: {
                    slug: req.params.slug
                }
            });

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success delete user'));

        } catch (err) {
            res.status(500).json(response(500, 'Internal server error', err));
            console.log(err);
        }
    },

}