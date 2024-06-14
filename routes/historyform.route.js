const layananforminput = require('../controllers/layananforminput.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

route.get('/user/historyform', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin', 'User'])], layananforminput.gethistoryformuser);

route.get('/user/historyform/:idforminput', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin', 'User'])], layananforminput.gethistorybyid);

module.exports = route;