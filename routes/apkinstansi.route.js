const apkinstansi = require('../controllers/apkinstansi.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/user/apkinstansi/create/:id', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi', 'Admin Layanan', 'Super Admin'])], upload.single('file'), apkinstansi.input);
route.get('/user/apkinstansi/get/:id', apkinstansi.get);
route.get('/user/apkinstansi/get/id/:id', apkinstansi.getbyid);
route.delete('/user/apkinstansi/delete/:id', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi', 'Admin Layanan', 'Super Admin'])], apkinstansi.delete);
route.put('/user/apkinstansi/update/:id', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi', 'Admin Layanan', 'Super Admin'])], upload.single('file'), apkinstansi.update);

module.exports = route;