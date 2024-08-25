const sertifController = require('../controllers/sertif.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

route.get('/user/detailsertif/:idlayanan', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin', 'User', 'Admin Layanan'])], sertifController.get); 

//untuk admin get template pdf
route.get('/user/sertif/:idlayanan', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi', 'Admin Layanan', 'Super Admin'])], sertifController.getsertif); 

//untuk print pdf berserta permohonan user
route.get('/user/sertif/:idlayanan/:idforminput', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi', 'Admin Layanan', 'Super Admin', 'User'])], sertifController.getsertif); 

route.put('/user/editsertif/:idlayanan', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin', 'User', 'Admin Layanan'])], sertifController.editinfosertif); 

module.exports = route;