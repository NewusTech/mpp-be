const layananController = require('../controllers/layanan.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/user/layanan/create', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], upload.single('image'), layananController.createlayanan);
route.get('/user/layanan/get', layananController.getlayanan); 
route.get('/user/layanan/dinas/get/:instansi_id', layananController.getlayananbydinas); 
route.get('/user/layanan/get/:id', layananController.getlayananById); 

//update layanan
route.put('/user/layanan/update/:id', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], upload.single('image'), layananController.updatelayanan); 

//update active online and offline layanan -> multiple
route.post('/user/layanan/updatestatus', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], layananController.updateMultipleLayanans); 

route.delete('/user/layanan/delete/:id', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], layananController.deletelayanan);

//history
route.get('/user/layanan/report', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], layananController.reportlayanan); 
route.get('/user/layanan/report-pdf', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], layananController.pdfreportlayanan); 

module.exports = route;