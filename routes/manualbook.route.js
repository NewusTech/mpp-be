const manualbookController = require('../controllers/manualbook.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
 
route.get('/user/manualbook/get', manualbookController.getmanualbook); 
route.put('/user/manualbook/update', [mid.checkRolesAndLogout(['Super Admin'])], upload.single('manualbook'), manualbookController.updatemanualbook); 

module.exports = route;