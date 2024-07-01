const contactController = require('../controllers/contact.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();
 
route.get('/user/contact/get', contactController.getcontact); 
route.put('/user/contact/update', [mid.checkRolesAndLogout(['Super Admin'])], contactController.updatecontact); 

module.exports = route;