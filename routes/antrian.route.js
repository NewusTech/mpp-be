const antrianController = require('../controllers/antrian.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/user/antrian/create', antrianController.createantrian);
route.post('/antrian/createfrombarcode', antrianController.createAntrianFromQRCode);
route.get('/user/antrian/get/instansi/:slugdinas', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Layanan', 'Super Admin', 'Admin Verifikasi', 'Bupati'])], antrianController.getantrianbyinstansi); 
route.get('/user/antrian/get/layanan/:sluglayanan', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Layanan', 'Super Admin', 'Admin Verifikasi', 'Bupati'])], antrianController.getantrianbylayanan); 

route.get('/antrian/check/:idlayanan', antrianController.checkantrian); 
route.post('/panggilantrian/get/:sluglayanan', antrianController.panggilAntrianBerikutnya); 
route.post('/antrianfinish/:idantrian', antrianController.finishAntrian); 

route.get('/user/antrian/pdf', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi', 'Admin Layanan', 'Super Admin'])], antrianController.pdfriwayatantrian); 

module.exports = route;