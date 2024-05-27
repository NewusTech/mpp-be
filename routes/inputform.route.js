const layananforminput = require('../controllers/layananforminput.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/user/inputform/create/:idlayanan', [mid.checkRolesAndLogout(['User'])], upload.any(), layananforminput.inputform);
route.put('/user/inputform/update/:idlayanan/:idlayanannum', [mid.checkRolesAndLogout(['User'])], upload.any(), layananforminput.updatedata);
route.get('/user/inputform/detail/:idlayanan/:idlayanannum', [mid.checkRolesAndLogout(['User'])], layananforminput.getdetailinputform);

module.exports = route;