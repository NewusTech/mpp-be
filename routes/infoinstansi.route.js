const infoinstansiController = require('../controllers/infoinstansi.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.get('/user/infoinstansi/get/:idinstansi', infoinstansiController.get); 

route.put('/user/infoinstansi/update/:idinstansi', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin', 'Admin Verifikasi', 'Admin Layanan'])], upload.single('image'), infoinstansiController.edit); 

module.exports = route;