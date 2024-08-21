const layananController = require('../controllers/layanan.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/user/layanan/create', [mid.checkRolesAndLogout(['Admin Instansi','Admin Layanan', 'Admin Verifikasi', 'Super Admin'])], upload.single('image'), layananController.createlayanan);
route.get('/user/layanan/get', [mid.checkRoles()], layananController.getlayanan); 
route.get('/user/layanan/barcodesurvey/:idlayanan', layananController.getbarcodesurvey); 
route.get('/user/layanan/dinas/get/:instansi_id', [mid.checkRoles()], layananController.getlayananbydinas); 
route.get('/user/layanan/get/:id', [mid.checkRoles()], layananController.getlayananById); 

//update layanan
route.put('/user/layanan/update/:id', [mid.checkRolesAndLogout(['Admin Instansi','Admin Layanan', 'Admin Verifikasi', 'Super Admin'])], upload.single('image'), layananController.updatelayanan); 

//update active online and offline layanan -> multiple
route.post('/user/layanan/updatestatus', [mid.checkRolesAndLogout(['Admin Instansi','Admin Layanan', 'Admin Verifikasi', 'Super Admin'])], layananController.updateMultipleLayanans); 

//update all active online / offline layanan
route.post('/user/layanan/activeonline/:instansiId', [mid.checkRolesAndLogout(['Admin Instansi','Admin Layanan', 'Admin Verifikasi', 'Super Admin'])], layananController.updateActiveOnlineLayanans); 
route.post('/user/layanan/activeoffline/:instansiId', [mid.checkRolesAndLogout(['Admin Instansi','Admin Layanan', 'Admin Verifikasi', 'Super Admin'])], layananController.updateActiveOfflineLayanans); 

route.delete('/user/layanan/delete/:id', [mid.checkRolesAndLogout(['Admin Instansi','Admin Layanan', 'Admin Verifikasi', 'Super Admin'])], layananController.deletelayanan);

//history
route.get('/user/layanan/report', [mid.checkRolesAndLogout(['Admin Instansi','Admin Layanan', 'Admin Verifikasi', 'Super Admin'])], layananController.reportlayanan); 
route.get('/user/layanan/report-pdf', [mid.checkRolesAndLogout(['Admin Instansi','Admin Layanan', 'Admin Verifikasi', 'Super Admin'])], layananController.pdfreportlayanan); 

module.exports = route;