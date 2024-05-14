//kode dari file kategoriblog.route.js

//import controller admin.controller.js 
const kategoriblogController = require('../controllers/kategoriblog.controller');

//import middleware dari auth.middleware.js
const mid = require('../middlewares/auth.middleware');

//express
const express = require('express');
const route = express.Router();

//import multer untuk mngehandle input dari form data
const multer = require('multer');
const upload = multer();

//membuat kategoriblog baru route
route.post('/admin/kategoriblog/create', //route
[mid.isLogin, mid.isLogout], //middleware
kategoriblogController.createkategoriblog); //controller

//mendapatkan semua data kategoriblog route
route.get('/admin/kategoriblog/get', //route
[mid.isLogin, mid.isLogout], //middleware
kategoriblogController.getkategoriblog); //controller

 //melihat data kategoriblog berdasarkan id route
route.get('/admin/kategoriblog/get/:id', //route
[mid.isLogin, mid.isLogout], //middleware
kategoriblogController.getkategoriblogById); //controller

 //mengupdate kategoriblog berdasarkan id route
 route.put('/admin/kategoriblog/update/:id', //route
 [mid.isLogin, mid.isLogout], //middleware
 kategoriblogController.updatekategoriblog); //controller

 //menghapus kategoriblog berdasarkan id route
 route.delete('/admin/kategoriblog/delete/:id', //route
 [mid.isLogin, mid.isLogout], //middleware
 kategoriblogController.deletekategoriblog); //controller

module.exports = route;