const layananforminput = require('../controllers/layananforminput.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/user/inputform/create/:idlayanan', [mid.checkRolesAndLogout(['User', 'Admin Instansi', 'Staff Instansi', 'Super Admin'])], upload.any(), layananforminput.inputform);
route.put('/user/inputform/update/:idlayanannum', [mid.checkRolesAndLogout(['User', 'Admin Instansi', 'Staff Instansi'])], upload.any(), layananforminput.updatedata);
route.get('/user/inputform/detail/:idlayanannum', [mid.checkRolesAndLogout(['User', 'Admin Instansi', 'Staff Instansi', 'Super Admin'])], layananforminput.getdetailinputform);

route.put('/user/inputform/updatestatus/:idlayanannum', [mid.checkRolesAndLogout(['Admin Instansi', 'Staff Instansi'])], upload.any(), layananforminput.updatestatuspengajuan);

route.put('/user/inputform/file/:idlayanannum', [mid.checkRolesAndLogout(['Admin Instansi', 'Staff Instansi', 'Super Admin'])], upload.single('file'), layananforminput.uploadfilehasil);

route.get('/user/layananform/getperbulan/:iddinas', layananforminput.totalpermohonan_bulan); 

module.exports = route;