const pengumumanController = require('../controllers/pengumuman.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
 
route.get('/user/pengumuman/get', pengumumanController.getpengumuman); 
route.put('/user/pengumuman/update', [mid.checkRolesAndLogout(['Super Admin'])], upload.single('file'), pengumumanController.updatepengumuman); 

module.exports = route;