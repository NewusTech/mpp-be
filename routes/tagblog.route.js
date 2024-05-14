//kode dari file tagblog.route.js

//import controller admin.controller.js 
const tagblogController = require('../controllers/tagblog.controller');

//import middleware dari auth.middleware.js
const mid = require('../middlewares/auth.middleware');

//express
const express = require('express');
const route = express.Router();

//import multer untuk mngehandle input dari form data
const multer = require('multer');
const upload = multer();

//membuat tagblog baru route
route.post('/admin/tagblog/create', //route
[mid.isLogin, mid.isLogout], //middleware
tagblogController.createtagblog); //controller

//mendapatkan semua data tagblog route
route.get('/admin/tagblog/get', //route
[mid.isLogin, mid.isLogout], //middleware
tagblogController.gettagblog); //controller

 //melihat data tagblog berdasarkan id route
route.get('/admin/tagblog/get/:id', //route
[mid.isLogin, mid.isLogout], //middleware
tagblogController.gettagblogById); //controller

 //mengupdate tagblog berdasarkan id route
 route.put('/admin/tagblog/update/:id', //route
 [mid.isLogin, mid.isLogout], //middleware
 tagblogController.updatetagblog); //controller

 //menghapus tagblog berdasarkan id route
 route.delete('/admin/tagblog/delete/:id', //route
 [mid.isLogin, mid.isLogout], //middleware
 tagblogController.deletetagblog); //controller

module.exports = route;