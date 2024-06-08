const antrianController = require('../controllers/antrian.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/user/antrian/create', [mid.checkRolesAndLogout(['User', 'Super Admin'])], antrianController.createantrian);
route.get('/user/antrian/get/:slugdinas', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], antrianController.getantrian); 
route.delete('/user/antrian/delete', [mid.checkRolesAndLogout(['Admin Instansi'])], antrianController.deleteantrian);

route.get('/user/panggilantrian/get/:slugdinas', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], antrianController.panggilAntrianBerikutnya); 

module.exports = route;