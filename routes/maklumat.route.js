const maklumatController = require('../controllers/maklumat.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();
 
route.get('/user/maklumat/get', maklumatController.get); 
route.put('/user/maklumat/update', [mid.checkRolesAndLogout(['Super Admin'])], maklumatController.update); 

module.exports = route;