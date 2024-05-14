//kode dari file auth.middleware.js 

//import config
const baseConfig = require('../config/base.config');

//import helper response
const { response} = require('../helpers/response.formatter');

//import model token
const { Token } = require('../models');

//import jwt dengan jsonwebtoken
const jwt = require('jsonwebtoken');

module.exports = {

    //untuk mengecek apakah admin sudah login atau belum
    isLogin : async (req, res, next) => {
        let token;
        try{
            token = req.headers.authorization.split(' ')[1];
        }catch(err){
            res.status(403).json(response(403,'unauthorized, theres something wrong with your token / settings'));
            return;
        }

        //cek apakah token ditemukan
        if(!token){
            res.status(403).json(response(403,'unauthorized, token not found'));
            return;
        }

        //verfikasi token jwt dengan module jsonwebtoken
        jwt.verify(token, baseConfig.auth_secret, (err, decoded) => {

             //cek apakah token valid
            if(err){
                res.status(403).json(response(403,'unauthorized, your token already expired or invalid'));
                return;
            }

            //masukan semua informasi didalam token kedalam data lalu parsing
            data = decoded;

            //next() untuk melanjutkan proses
            next();
        })

    },

    //untuk menegecek apakah admin sudah logout atau belum
    isLogout: async (req, res, next) => {
        let token = req.headers.authorization.split(' ')[1];
        
        //mendapatkan data token berdasarkan token yang dikirimkan
        let tokenCheck = await Token.findOne({
            where:{
                token: token
            }
        })

        //jika token ditemukan pada table tokens, maka admin sudah logout
        if(tokenCheck){
            res.status(403).json(response(403,'unauthorized , you already logout'));
            return;
        }else{
            //next() untuk melanjutkan proses
            next();
        }
        
    },

}