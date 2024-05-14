//kode dari file kategoriportofolio.route.js

//import controller admin.controller.js 
const kategoriportofolioController = require('../controllers/kategoriportofolio.controller');

//import middleware dari auth.middleware.js
const mid = require('../middlewares/auth.middleware');

//express
const express = require('express');
const route = express.Router();

//import multer untuk mngehandle input dari form data
const multer = require('multer');
const upload = multer();

//membuat kategoriportofolio baru route
route.post('/admin/kategoriportofolio/create', //route
[mid.isLogin, mid.isLogout], //middleware
kategoriportofolioController.createkategoriportofolio); //controller

//mendapatkan semua data kategoriportofolio route
route.get('/admin/kategoriportofolio/get', //route
[mid.isLogin, mid.isLogout], //middleware
kategoriportofolioController.getkategoriportofolio); //controller

 //melihat data kategoriportofolio berdasarkan id route
route.get('/admin/kategoriportofolio/get/:id', //route
[mid.isLogin, mid.isLogout], //middleware
kategoriportofolioController.getkategoriportofolioById); //controller

 //mengupdate kategoriportofolio berdasarkan id route
 route.put('/admin/kategoriportofolio/update/:id', //route
 [mid.isLogin, mid.isLogout], //middleware
 kategoriportofolioController.updatekategoriportofolio); //controller

 //menghapus kategoriportofolio berdasarkan id route
 route.delete('/admin/kategoriportofolio/delete/:id', //route
 [mid.isLogin, mid.isLogout], //middleware
 kategoriportofolioController.deletekategoriportofolio); //controller

module.exports = route;