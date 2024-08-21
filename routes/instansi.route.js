const instansiController = require('../controllers/instansi.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/user/instansi/create', [mid.checkRolesAndLogout(['Super Admin'])], upload.single('image'), instansiController.createinstansi);
route.get('/user/instansi/get', [mid.checkRoles()], instansiController.getinstansi); 
route.get('/user/instansi/get/:slug', [mid.checkRoles()], instansiController.getinstansiBySlug); 
route.put('/user/instansi/update/:slug', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], upload.single('image'), instansiController.updateinstansi); 
route.delete('/user/instansi/delete/:slug', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], instansiController.deleteinstansi);

route.get('/user/instansi/kinerja/:instansi_id', [mid.checkRolesAndLogout(['Admin Instansi','Admin Layanan', 'Admin Verifikasi', 'Super Admin'])], instansiController.reportkinerja); 

module.exports = route;