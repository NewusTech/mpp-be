const layananforminput = require('../controllers/layananforminput.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/user/inputform/create/:idlayanan', [mid.checkRolesAndLogout(['User'])], upload.any(), layananforminput.inputform);
route.put('/user/inputform/update/:idlayanannum', [mid.checkRolesAndLogout(['User'])], upload.any(), layananforminput.updatedata);
route.get('/user/inputform/detail/:idlayanannum', [mid.checkRolesAndLogout(['User', 'Admin Instansi', 'Super Admin'])], layananforminput.getdetailinputform);

route.put('/user/inputform/updatestatus/:idlayanannum', [mid.checkRolesAndLogout(['Admin Instansi'])], upload.any(), layananforminput.updatestatuspengajuan);

module.exports = route;