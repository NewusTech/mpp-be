const manualbookController = require('../controllers/manualbook.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
 
route.get('/user/manualbook/get', manualbookController.getmanualbook);
route.get('/user/manualbook/get/:id', manualbookController.getmanualbookbyid); 
route.put('/user/manualbook/update/:id', [mid.checkRolesAndLogout(['Super Admin'])], upload.fields([{ name: 'manualbook', maxCount: 1 }, { name: 'video', maxCount: 1 }]), manualbookController.updatemanualbook);

module.exports = route;