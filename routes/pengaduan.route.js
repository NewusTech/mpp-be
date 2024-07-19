const pengaduanController = require('../controllers/pengaduan.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/user/pengaduan/create', [mid.checkRolesAndLogout(['User'])], upload.single('image'), pengaduanController.createpengaduan);
route.get('/user/pengaduan/get', [mid.checkRolesAndLogout(['User', 'Admin Instansi', 'Admin Verifikasi', 'Admin Layanan', 'Super Admin'])], pengaduanController.getpengaduan); 
route.get('/user/pengaduan/get/:id', pengaduanController.getpengaduanById); 
route.put('/user/pengaduan/update/:id', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi', 'Admin Layanan', 'Super Admin'])], pengaduanController.updatepengaduan); 
route.delete('/user/pengaduan/delete/:id', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi', 'Admin Layanan', 'Super Admin'])], pengaduanController.deletepengaduan);

module.exports = route;