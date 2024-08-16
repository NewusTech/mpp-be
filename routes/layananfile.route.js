const layananfile = require('../controllers/layananfile.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/user/layananfile/create/:idlayanan', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi', 'Admin Layanan', 'Super Admin'])], upload.any(), layananfile.input);
route.get('/user/layananfile/get/:idlayanan', layananfile.get);
route.delete('/user/layananfile/delete/:idlayanan', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi', 'Admin Layanan', 'Super Admin'])], layananfile.delete);
route.put('/user/layananfile/update/:idlayanan', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi', 'Admin Layanan', 'Super Admin'])], upload.any(), layananfile.update);

module.exports = route;