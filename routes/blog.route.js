//kode dari file blog.route.js

//import controller admin.controller.js 
const blogController = require('../controllers/blog.controller');

//import middleware dari auth.middleware.js
const mid = require('../middlewares/auth.middleware');

//express
const express = require('express');
const route = express.Router();

//import multer untuk mngehandle input dari form data
const multer = require('multer');
const path = require('path');

// Konfigurasi penyimpanan file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/blog'); // Tentukan folder penyimpanan
    },
    filename: function (req, file, cb) {
        // Buat nama file baru (Anda bisa menggunakan timestamp, UUID, atau nama asli file)
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Inisialisasi middleware multer
const upload = multer({ storage: storage });

//membuat blog baru route
route.post('/admin/blog/create', //route
    [mid.isLogin, mid.isLogout], //middleware
    upload.single('image'),
    blogController.createblog); //controller

//mendapatkan semua data blog route
route.get('/admin/blog/get', //route
    [mid.isLogin, mid.isLogout], //middleware
    blogController.getblog); //controller

//melihat data blog berdasarkan id route
route.get('/admin/blog/get/:id', //route
    [mid.isLogin, mid.isLogout], //middleware
    blogController.getblogById); //controller

//mengupdate blog berdasarkan id route
route.put('/admin/blog/update/:id', //route
    [mid.isLogin, mid.isLogout], //middleware
    upload.single('image'),
    blogController.updateblog); //controller

//menghapus blog berdasarkan id route
route.delete('/admin/blog/delete/:id', //route
    [mid.isLogin, mid.isLogout], //middleware
    blogController.deleteblog); //controller

module.exports = route;