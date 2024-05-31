const suratController = require('../controllers/surat.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();


route.get('/user/surat/:idlayanan', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin', 'User'])], suratController.getsurat); 

module.exports = route;