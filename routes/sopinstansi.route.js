const sopinstansi = require('../controllers/sopinstansi.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/user/sopinstansi/create/:id', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi', 'Admin Layanan', 'Super Admin'])], upload.single('file'), sopinstansi.input);
route.get('/user/sopinstansi/get/:id', sopinstansi.get);
route.get('/user/sopinstansi/get/id/:id', sopinstansi.getbyid);
route.delete('/user/sopinstansi/delete/:id', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi', 'Admin Layanan', 'Super Admin'])], sopinstansi.delete);
route.put('/user/sopinstansi/update/:id', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi', 'Admin Layanan', 'Super Admin'])], upload.single('file'), sopinstansi.update);

module.exports = route;