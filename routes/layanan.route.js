//kode dari file layanan.route.js

//import controller user.controller.js 
const layananController = require('../controllers/layanan.controller');

//import middleware dari auth.middleware.js
const mid = require('../middlewares/auth.middleware');

//express
const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/user/layanan/create', [mid.checkRolesAndLogout(['Admin Instansi'])], upload.single('image'), layananController.createlayanan);
route.get('/user/layanan/get', [mid.checkRolesAndLogout(['Admin Instansi'])], layananController.getlayanan); 
route.get('/user/layanan/get/:id', [mid.checkRolesAndLogout(['Admin Instansi'])], layananController.getlayananById); 
route.put('/user/layanan/update/:id', [mid.checkRolesAndLogout(['Admin Instansi'])], upload.single('image'), layananController.updatelayanan); 
route.delete('/user/layanan/delete/:id', [mid.checkRolesAndLogout(['Admin Instansi'])], layananController.deletelayanan);

module.exports = route;