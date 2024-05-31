const layananController = require('../controllers/layanan.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/user/layanan/create', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], upload.single('image'), layananController.createlayanan);
route.get('/user/layanan/get', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], layananController.getlayanan); 
route.get('/user/layanan/dinas/get/:instansi_id', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin', 'User'])], layananController.getlayananbydinas); 
route.get('/user/layanan/get/:id', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin', 'User'])], layananController.getlayananById); 
route.put('/user/layanan/update/:id', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], upload.single('image'), layananController.updatelayanan); 
route.delete('/user/layanan/delete/:id', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], layananController.deletelayanan);

module.exports = route;