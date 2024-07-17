const layananforminput = require('../controllers/layananforminput.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/user/inputform/create/:idlayanan', [mid.checkRolesAndLogout(['User', 'Admin Instansi', 'Admin Verifikasi', 'Super Admin'])], upload.any(), layananforminput.inputform);
route.put('/user/inputform/update/:idlayanannum', [mid.checkRolesAndLogout(['User', 'Admin Instansi', 'Admin Verifikasi'])], upload.any(), layananforminput.updatedata);
route.get('/user/inputform/detail/:idlayanannum', [mid.checkRolesAndLogout(['User', 'Admin Instansi', 'Admin Verifikasi', 'Super Admin'])], layananforminput.getdetailinputform);

route.put('/user/inputform/updatestatus/:idlayanannum', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi'])], upload.any(), layananforminput.updatestatuspengajuan);

route.put('/user/inputform/file/:idlayanannum', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi', 'Super Admin'])], upload.single('file'), layananforminput.uploadfilehasil);

module.exports = route;