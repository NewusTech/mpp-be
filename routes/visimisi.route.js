const visimisiController = require('../controllers/visimisi.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();
 
route.get('/user/visimisi/get', visimisiController.getvisimisi); 
route.put('/user/visimisi/update', [mid.checkRolesAndLogout(['Super Admin'])], visimisiController.updatevisimisi); 

module.exports = route;