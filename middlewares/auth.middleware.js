const baseConfig = require('../config/base.config');
const { response } = require('../helpers/response.formatter');
const { Token, User, Role } = require('../models');

const jwt = require('jsonwebtoken');

module.exports = {

    //untuk mengecek apakah user sudah login atau belum
    isLogin: async (req, res, next) => {
        let token;
        try {
            token = req.headers.authorization.split(' ')[1];
        } catch (err) {
            res.status(403).json(response(403, 'unauthorized, theres something wrong with your token / settings'));
            return;
        }

        //cek apakah token ditemukan
        if (!token) {
            res.status(403).json(response(403, 'unauthorized, token not found'));
            return;
        }

        //verfikasi token jwt dengan module jsonwebtoken
        jwt.verify(token, baseConfig.auth_secret, (err, decoded) => {

            //cek apakah token valid
            if (err) {
                res.status(403).json(response(403, 'unauthorized, your token already expired or invalid'));
                return;
            }

            //masukan semua informasi didalam token kedalam data lalu parsing
            data = decoded;

            //next() untuk melanjutkan proses
            next();
        })

    },

    //untuk menegecek apakah user sudah logout atau belum
    isLogout: async (req, res, next) => {
        let token = req.headers.authorization.split(' ')[1];

        //mendapatkan data token berdasarkan token yang dikirimkan
        let tokenCheck = await Token.findOne({
            where: {
                token: token
            }
        })

        //jika token ditemukan pada table tokens, maka user sudah logout
        if (tokenCheck) {
            res.status(403).json(response(403, 'unauthorized , you already logout'));
            return;
        } else {
            //next() untuk melanjutkan proses
            next();
        }

    },

    // Middleware untuk memeriksa peran pengguna
    authorizeRole: (requiredRole) => {
        console.log("asdasdasd", requiredRole)
        return async (req, res, next) => {
            try {
                const user = await User.findByPk(req.user.id, {
                    include: [{
                        model: Role,
                        as: 'role'
                    }]
                });

                console.log("aaaaaaaaaaaaaaA", user.role.name)

                if (user && user.role && user.role.name === requiredRole) {
                    next(); // Peran sesuai, lanjutkan ke route berikutnya
                } else {
                    res.status(403).json(response(403, 'unauthorized, insufficient role'));
                }
            } catch (err) {
                res.status(500).json(response(500, 'internal server error'));
            }
        };
    }
}