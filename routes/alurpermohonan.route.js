const alurpermohonanController = require('../controllers/alurpermohonan.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

route.post('/user/alurpermohonan/create', [mid.checkRolesAndLogout(['Super Admin'])], alurpermohonanController.createalurpermohonan);
route.get('/user/alurpermohonan/get', alurpermohonanController.getalurpermohonan); 
route.get('/user/alurpermohonan/get/:id', alurpermohonanController.getalurpermohonanById); 
route.put('/user/alurpermohonan/update/:id', [mid.checkRolesAndLogout(['Super Admin'])], alurpermohonanController.updatealurpermohonan); 
route.delete('/user/alurpermohonan/delete/:id', [mid.checkRolesAndLogout(['Super Admin'])], alurpermohonanController.deletealurpermohonan);

module.exports = route;