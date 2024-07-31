const bukutamuController = require('../controllers/bukutamu.controller');

const mid = require('../middlewares/auth.middleware');
const express = require('express');
const route = express.Router();

route.post('/bukutamu/create', bukutamuController.createbukutamu);
route.get('/bukutamu/get', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin', 'Admin Verifikasi', 'Admin Layanan', 'Bupati'])], bukutamuController.getbukutamu);
route.get('/bukutamu/get/pdf', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin', 'Admin Verifikasi', 'Admin Layanan', 'Bupati'])], bukutamuController.pdfbukutamu);
route.get('/bukutamu/get/:id', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin', 'Admin Verifikasi', 'Admin Layanan', 'Bupati'])], bukutamuController.getBukutamuByid);

module.exports = route;