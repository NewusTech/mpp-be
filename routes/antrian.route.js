const antrianController = require('../controllers/antrian.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/user/antrian/create', [mid.checkRolesAndLogout(['User', 'Super Admin', 'Admin Instansi', 'Staff Instansi'])], antrianController.createantrian);
route.get('/user/antrian/get/:slugdinas', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin', 'Staff Instansi', 'Bupati'])], antrianController.getantrian); 
route.delete('/user/antrian/delete', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], antrianController.deleteantrian);

route.get('/user/antrian/getforuser', [mid.checkRolesAndLogout(['User'])], antrianController.getantrianforuser); 
route.get('/user/antrian/:idantrian', [mid.checkRolesAndLogout(['User', 'Admin Instansi', 'Super Admin'])], antrianController.getantrianbyid); 

module.exports = route;