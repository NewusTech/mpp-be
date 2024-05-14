//kode dari file tagportofolio.route.js

//import controller admin.controller.js 
const tagportofolioController = require('../controllers/tagportofolio.controller');

//import middleware dari auth.middleware.js
const mid = require('../middlewares/auth.middleware');

//express
const express = require('express');
const route = express.Router();

//import multer untuk mngehandle input dari form data
const multer = require('multer');
const upload = multer();

//membuat tagportofolio baru route
route.post('/admin/tagportofolio/create', //route
[mid.isLogin, mid.isLogout], //middleware
tagportofolioController.createtagportofolio); //controller

//mendapatkan semua data tagportofolio route
route.get('/admin/tagportofolio/get', //route
[mid.isLogin, mid.isLogout], //middleware
tagportofolioController.gettagportofolio); //controller

 //melihat data tagportofolio berdasarkan id route
route.get('/admin/tagportofolio/get/:id', //route
[mid.isLogin, mid.isLogout], //middleware
tagportofolioController.gettagportofolioById); //controller

 //mengupdate tagportofolio berdasarkan id route
 route.put('/admin/tagportofolio/update/:id', //route
 [mid.isLogin, mid.isLogout], //middleware
 tagportofolioController.updatetagportofolio); //controller

 //menghapus tagportofolio berdasarkan id route
 route.delete('/admin/tagportofolio/delete/:id', //route
 [mid.isLogin, mid.isLogout], //middleware
 tagportofolioController.deletetagportofolio); //controller

module.exports = route;