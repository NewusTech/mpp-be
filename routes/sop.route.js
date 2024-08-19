const sopController = require('../controllers/sop.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
 
route.get('/user/sop/get', sopController.getsop); 
route.put('/user/sop/update', [mid.checkRolesAndLogout(['Super Admin'])], upload.single('file'), sopController.updatesop); 

module.exports = route;