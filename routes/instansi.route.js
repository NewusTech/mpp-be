//kode dari file instansi.route.js

//import controller user.controller.js 
const instansiController = require('../controllers/instansi.controller');

//import middleware dari auth.middleware.js
const mid = require('../middlewares/auth.middleware');

//express
const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/user/instansi/create', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], upload.single('image'), instansiController.createinstansi);
route.get('/user/instansi/get', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin', 'User'])], instansiController.getinstansi); 
route.get('/user/instansi/get/:id', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin', 'User'])], instansiController.getinstansiById); 
route.put('/user/instansi/update/:id', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], upload.single('image'), instansiController.updateinstansi); 
route.delete('/user/instansi/delete/:id', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], instansiController.deleteinstansi);

module.exports = route;