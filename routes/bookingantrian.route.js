const bookingantrianController = require('../controllers/bookingantrian.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/user/bookingantrian/create', [mid.checkRolesAndLogout(['User'])], bookingantrianController.createbookingantrian);
route.get('/user/bookingantrian/get/:slugdinas', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin', 'Admin Verifikasi', 'Admin Layanan', 'Bupati'])], bookingantrianController.getbookingantrian); 
route.delete('/user/bookingantrian/delete', [mid.checkRolesAndLogout(['Admin Instansi'])], bookingantrianController.deletebookingantrian);

route.get('/user/bookingantrian/getforuser', [mid.checkRolesAndLogout(['User'])], bookingantrianController.getbookingantrianforuser); 
route.get('/user/bookingantrian/:idbookingantrian', [mid.checkRolesAndLogout(['User', 'Admin Instansi', 'Super Admin', 'Admin Verifikasi', 'Admin Layanan'])], bookingantrianController.getbookingantrianbyid); 
route.get('/user/bookingantrian/pdf/:idbookingantrian', [mid.checkRolesAndLogout(['User', 'Admin Instansi', 'Super Admin'])], bookingantrianController.getPDFbookingantrianbyid); 

module.exports = route;