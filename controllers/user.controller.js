const { response } = require('../helpers/response.formatter');

const { User, Token, Instansi, Role } = require('../models');
const baseConfig = require('../config/base.config');
const passwordHash = require('password-hash');
const jwt = require('jsonwebtoken');

const Validator = require("fastest-validator");
const v = new Validator();

module.exports = {

    //membuat user baru
    createUser: async (req, res) => {
        try {

            console.log(req)

            //membuat schema untuk validasi
            const schema = {
                name: {
                    type: "string",
                    min: 3,
                },
                email: {
                    type: "email",
                    min: 3,
                },
                password: {
                    type: "string",
                    min: 3,
                },
                instansi_id: {
                    type: "number",
                    optional: true
                },
                role_id: {
                    type: "number",
                    optional: true
                },
            };

            //validasi
            const validate = v.validate({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                instansi_id: req.body.instansi_id !== undefined ? Number(req.body.instansi_id) : null,
                role_id: req.body.role_id !== undefined ? Number(req.body.role_id) : null,
            }, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //mendapatkan data user untuk pengecekan
            let userGets = await User.findOne({ 
                where: {
                    email: req.body.email
                }
            }
            );

            //cek apakah email sudah terdaftar
            if (userGets) {
                res.status(409).json(response(409, 'email already registered'));
                return;
            }

            //membuat object untuk create user
            let userCreateObj = {
                name: req.body.name,
                email: req.body.email,
                password: passwordHash.generate(req.body.password),
                instansi_id: req.body.instansi_id !== undefined ? Number(req.body.instansi_id) : null,
                role_id: req.body.role_id !== undefined ? Number(req.body.role_id) : null,
            }

            //membuat user baru
            let userCreate = await User.create(userCreateObj);

            //mengirim response dengan bantuan helper response.formatter
            res.status(201).json(response(201, 'user created', userCreate));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //login user
    loginUser: async (req, res) => {
        try {

            //membuat schema untuk validasi
            const schema = {
                email: {
                    type: "email",
                    min: 3,
                },
                password: {
                    type: "string",
                    min: 3,
                }
            };

            //memasukan req.body ke dalam variable
            let email = req.body.email;
            let password = req.body.password;

            //validasi menggunakan module fastest-validator
            const validate = v.validate({
                email: email,
                password: password,
            }, schema);
            if (validate.length > 0) {
                res.status(400).json(response(400, 'validation failed', validate));
                return;
            }

            //mendapatkan data user untuk pengecekan
            let userGets = await User.findOne({ //kita menggunakan model User
                where: {
                    email: email
                }
            });

            //cek apakah email ada
            if (!userGets) {
                res.status(404).json(response(404, 'email not found'));
                return;
            }

            //check password
            if (!passwordHash.verify(password, userGets.password)) {
                res.status(403).json(response(403, 'password wrong'));
                return;
            }

            //membuat token jwt
            let token = jwt.sign({
                userId: userGets.id, //kita parsing id user
            }, baseConfig.auth_secret, { //auth secret adalah secret key yang kita buat di config/base.config.js
                expiresIn: 86400 // expired dalam 24 jam
            });

            //mengirim response dengan bantuan helper response.formatter
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
            //mendapatkan data semua user
            let userGets = await User.findAll({
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
                ],
                attributes: { exclude: ['Instansi', 'Role'] }
            });

            let formattedUsers = userGets.map(user => {
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    instansi_id: user.Instansi?.id,
                    instansi_name: user.Instansi?.name,
                    role_id: user.Role?.id,
                    role_name: user.Role?.name,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                };
            });

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success get user', formattedUsers));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

    //mendapatkan data user berdasarkan id
    getuserById: async (req, res) => {
        try {
            //mendapatkan data user berdasarkan id
            let userGet = await User.findOne({
                where: {
                    id: req.params.id
                },
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
                ],
                attributes: { exclude: ['Instansi', 'Role'] }
            });

            //cek jika user tidak ada
            if (!userGet) {
                res.status(404).json(response(404, 'user not found'));
                return;
            }

            let formattedUsers = {
                id: userGet.id,
                name: userGet.name,
                email: userGet.email,
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

    //menghapus user berdasarkan id
    deleteuser: async (req, res) => {
        try {

            //mendapatkan data user untuk pengecekan
            let userGet = await User.findOne({
                where: {
                    id: req.params.id
                }
            })

            //cek apakah data user ada
            if (!userGet) {
                res.status(404).json(response(404, 'user not found'));
                return;
            }

            await User.destroy({
                where: {
                    id: req.params.id,
                }
            })

            //response menggunakan helper response.formatter
            res.status(200).json(response(200, 'success delete user'));

        } catch (err) {
            res.status(500).json(response(500, 'internal server error', err));
            console.log(err);
        }
    },

}