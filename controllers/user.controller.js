const { response } = require('../helpers/response.formatter');

const { User, Token, Instansi, Layanan, Role, Userinfo, Kecamatan, Desa, Userpermission, Permission, sequelize } = require('../models');
const baseConfig = require('../config/base.config');
const passwordHash = require('password-hash');
const jwt = require('jsonwebtoken');
const { generatePagination } = require('../pagination/pagination');
const Validator = require("fastest-validator");
const v = new Validator();
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const logger = require('../errorHandler/logger');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_NAME,
        pass: process.env.EMAIL_PW,
    }
});

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
                telepon: { type: "string", min: 7, max: 15, pattern: /^[0-9]+$/, optional: true },
                password: { type: "string", min: 5, max: 16 },
                instansi_id: { type: "number", optional: true },
                layanan_id: { type: "number", optional: true },
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
                layanan_id: req.body.layanan_id !== undefined ? Number(req.body.layanan_id) : undefined,
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
                // Format pesan error dalam bahasa Indonesia
                const errorMessages = validate.map(error => {
                    if (error.type === 'stringMin') {
                        return `${error.field} minimal ${error.expected} karakter`;
                    } else if (error.type === 'stringMax') {
                        return `${error.field} maksimal ${error.expected} karakter`;
                    } else if (error.type === 'stringPattern') {
                        return `${error.field} format tidak valid`;
                    } else {
                        return `${error.field} tidak valid`;
                    }
                });

                res.status(400).json({
                    status: 400,
                    message: errorMessages.join(', ')
                });
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
                layanan_id: req.body.layanan_id !== undefined ? Number(req.body.layanan_id) : undefined,
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
            if (err.name === 'SequelizeUniqueConstraintError') {
                // Menangani error khusus untuk constraint unik
                res.status(400).json({
                    status: 400,
                    message: `${err.errors[0].path} sudah terdaftar`
                });
            } else {
                // Menangani error lainnya
                res.status(500).json(response(500, 'terjadi kesalahan pada server', err));
            }
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

            let isAdmin = req.query.admin;
            let isUser = req.query.user;
            let nik = req.body.nik;
            let password = req.body.password;

            // Validasi input
            const validate = v.validate({
                nik: nik,
                password: password,
            }, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            // Mencari data user berdasarkan nik atau email yang disimpan dalam nik
            let whereClause = {
                [Op.or]: [
                    { nik: nik },
                    { email: nik },
                    { telepon: nik }
                ]
            };

            const adminCondition = {};
            adminCondition.deletedAt = null;
            whereClause.deletedAt = null;

            if (isAdmin) {
                adminCondition['$User.role_id$'] = {
                    [Op.ne]: 5
                };
            }

            if (isUser) {
                adminCondition['$User.role_id$'] = {
                    [Op.eq]: 5
                };
            }

            let userinfo = await Userinfo.findOne({
                where: whereClause,
                attributes: ['nik', 'email', 'id', 'telepon'],
                include: [
                    {
                        model: User,
                        attributes: ['password', 'id', 'role_id', 'layanan_id', 'instansi_id'],
                        include: [
                            {
                                model: Role,
                                attributes: ['id', 'name']
                            },
                            {
                                model: Instansi,
                                attributes: ['id', 'name', 'image']
                            },
                            {
                                model: Permission,
                                through: Userpermission,
                                as: 'permissions'
                            },
                            {
                                model: Layanan,
                                attributes: ['id', 'name', 'code', 'slug']
                            }
                        ],
                        where: adminCondition
                    },
                ],
            });

            // cek apakah user ditemukan
            if (!userinfo) {
                res.status(404).json(response(404, 'User not found'));
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
                instansi_id: userinfo?.User?.Instansi?.id ?? undefined,
                instansi_image: userinfo?.User?.Instansi?.image ?? undefined,
                layanan: userinfo?.User?.Layanan?.name ?? undefined,
                layanan_id: userinfo?.User?.Layanan?.id ?? undefined,
                layanan_code: userinfo?.User?.Layanan?.code ?? undefined,
                layanan_slug: userinfo?.User?.Layanan?.slug ?? undefined,
                // permissions: userinfo?.User?.permissions,
                permission: userinfo.User.permissions.map(permission => permission.name)
            }, baseConfig.auth_secret, { // auth secret
                expiresIn: 864000 // expired 24 jam
            });

            res.status(200).json(response(200, 'login success', { token: token }));

        } catch (err) {

            logger.error(`Error : ${err}`);
            logger.error(`Error message: ${err.message}`);
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
                            model: Layanan,
                            attributes: ['name', 'id'],
                            as: 'Layanan'
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
                    layanan_id: user.Layanan?.id,
                    layanan_name: user.Layanan?.name,
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
            const whereCondition = { id: data.user_akun_id };

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
                filektp: userGet.Userinfo?.filektp,
                filekk: userGet.Userinfo?.filekk,
                foto: userGet.Userinfo?.foto,
                fotoprofil: userGet.Userinfo?.fotoprofil,
                aktalahir: userGet.Userinfo?.aktalahir,
                fileijazahsd: userGet.Userinfo?.fileijazahsd,
                fileijazahsmp: userGet.Userinfo?.fileijazahsmp,
                fileijazahsma: userGet.Userinfo?.fileijazahsma,
                fileijazahlain: userGet.Userinfo?.fileijazahlain,
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

    changePassword: async (req, res) => {
        const slug = req.params.slug;
        const { oldPassword, newPassword, confirmNewPassword } = req.body;

        if (!oldPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: 'Semua kolom wajib diisi.' });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: 'Kata sandi baru tidak cocok.' });
        }

        try {
            const user = await User.findOne({ where: { slug } });
            if (!user) {
                return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
            }

            if (!passwordHash.verify(oldPassword, user.password)) {
                return res.status(400).json({ message: 'Kata sandi lama salah.' });
            }

            user.password = passwordHash.generate(newPassword);
            await user.save();

            return res.status(200).json({ message: 'Password has been updated.' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    },

    changePasswordFromAdmin: async (req, res) => {
        const slug = req.params.slug;
        const { newPassword, confirmNewPassword } = req.body;

        if (!newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: 'Semua kolom wajib diisi.' });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: 'Kata sandi baru tidak cocok.' });
        }

        try {
            const user = await User.findOne({ where: { slug } });
            if (!user) {
                return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
            }

            user.password = passwordHash.generate(newPassword);
            await user.save();

            return res.status(200).json({ message: 'Password has been updated.' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    },

    forgotPassword: async (req, res) => {
        const { email } = req.body;

        try {
            const user = await User.findOne({
                include: [
                    {
                        model: Userinfo,
                        attributes: ['email'],
                        where: { email },
                    }
                ]
            },);

            if (!user) {
                return res.status(404).json({ message: 'Email tidak terdaftar.' });
            }

            console.log("aaaaaaa", user?.Userinfo?.email)
            const token = crypto.randomBytes(20).toString('hex');
            const resetpasswordexpires = Date.now() + 3600000;

            console.log("rokwen", token)
            user.resetpasswordtoken = token;
            user.resetpasswordexpires = resetpasswordexpires;

            await user.save();

            const mailOptions = {
                to: user?.Userinfo?.email,
                from: process.env.EMAIL_NAME,
                subject: 'Password Reset',
                text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                Please click on the following link, or paste this into your browser to complete the process:\n\n
                ${process.env.WEBSITE_URL}/new-password/${token}\n\n
                If you did not request this, please ignore this email and your password will remain unchanged.\n`
            };

            transporter.sendMail(mailOptions, (err) => {
                if (err) {
                    console.error('There was an error: ', err);
                    return res.status(500).json({ message: `${process.env.EMAIL_NAME} ${process.env.EMAIL_PW}Error sending the email.  ${err}` });
                }
                res.status(200).json({ message: 'Email telah dikirim ke dengan instruksi lebih lanjut.' });
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    },

    resetPassword: async (req, res) => {
        const { token } = req.params;
        const { newPassword, confirmNewPassword } = req.body;

        if (!newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: 'Semua kolom wajib diisi.' });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: 'Kata sandi baru tidak cocok.' });
        }

        try {
            const user = await User.findOne({
                where: {
                    resetpasswordtoken: token,
                    resetpasswordexpires: { [Op.gt]: Date.now() }
                }
            });

            if (!user) {
                return res.status(400).json({ message: 'Token reset kata sandi tidak valid atau telah kedaluwarsa.' });
            }

            user.password = passwordHash.generate(newPassword);
            user.resetpasswordtoken = null;
            user.resetpasswordexpires = null;
            await user.save();

            return res.status(200).json({ message: 'Password berhasil diganti.' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
    },

    getUserPermissions: async (req, res) => {
        const { userId } = req.params;

        try {
            // Find the user
            const user = await User.findByPk(userId, {
                include: {
                    model: Permission,
                    through: Userpermission,
                    as: 'permissions'
                }
            });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json(response(200, 'success get data', { permissions: user?.permissions }));
        } catch (error) {
            logger.error(`Error : ${error}`);
            logger.error(`Error message: ${error.message}`);
            console.error('Error fetching user permissions:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    updateUserpermissions: async (req, res) => {
        const { userId, permissions } = req.body;

        try {
            // Find the user
            const user = await User.findByPk(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Find all permission records that match the given permission names
            const permissionRecords = await Permission.findAll({
                where: {
                    id: permissions
                }
            });

            if (permissionRecords.length !== permissions.length) {
                return res.status(400).json({ message: 'Some permissions not found' });
            }

            // Get the ids of the found permissions
            const permissionIds = permissionRecords.map(permission => permission.id);

            // Remove old permissions
            await Userpermission.destroy({
                where: { user_id: userId }
            });

            // Add new permissions
            const userPermissions = permissionIds.map(permissionId => ({
                user_id: userId,
                permission_id: permissionId
            }));

            await Userpermission.bulkCreate(userPermissions);

            res.status(200).json({ message: 'Permissions updated successfully' });
        } catch (error) {
            logger.error(`Error : ${error}`);
            logger.error(`Error message: ${error.message}`);
            console.error('Error updating permissions:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}