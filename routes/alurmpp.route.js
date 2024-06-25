const alurmppController = require('../controllers/alurmpp.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
 
route.get('/user/alurmpp/get', alurmppController.getalurmpp); 
route.put('/user/alurmpp/update', [mid.checkRolesAndLogout(['Super Admin'])], upload.single('image'), alurmppController.updatealurmpp); 

module.exports = route;