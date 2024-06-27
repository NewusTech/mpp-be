const alurbookingController = require('../controllers/alurbooking.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

route.post('/user/alurbooking/create', [mid.checkRolesAndLogout(['Super Admin'])], alurbookingController.createalurbooking);
route.get('/user/alurbooking/get', alurbookingController.getalurbooking); 
route.get('/user/alurbooking/get/:id', alurbookingController.getalurbookingById); 
route.put('/user/alurbooking/update/:id', [mid.checkRolesAndLogout(['Super Admin'])], alurbookingController.updatealurbooking); 
route.delete('/user/alurbooking/delete/:id', [mid.checkRolesAndLogout(['Super Admin'])], alurbookingController.deletealurbooking);

module.exports = route;