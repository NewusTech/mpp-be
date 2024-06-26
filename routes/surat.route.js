const suratController = require('../controllers/surat.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

route.get('/user/detailsurat/:idlayanan', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin', 'User'])], suratController.get); 

//untuk admin get template pdf
route.get('/user/surat/:idlayanan', [mid.checkRolesAndLogout(['Admin Instansi', 'Staff Instansi', 'Super Admin'])], suratController.getsurat); 

//untuk print pdf berserta permohonan user
route.get('/user/surat/:idlayanan/:idforminput', [mid.checkRolesAndLogout(['Admin Instansi', 'Staff Instansi', 'Super Admin'])], suratController.getsurat); 

route.put('/user/editsurat/:idlayanan', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin', 'User'])], suratController.editinfosurat); 

module.exports = route;