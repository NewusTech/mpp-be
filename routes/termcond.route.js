const termcondController = require('../controllers/termcond.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();
 
route.get('/user/termcond/get', termcondController.gettermcond); 
route.put('/user/termcond/update', [mid.checkRolesAndLogout(['Super Admin'])], termcondController.updatetermcond); 

module.exports = route;