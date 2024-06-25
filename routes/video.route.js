const videoController = require('../controllers/video.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
 
route.get('/user/video/get', videoController.getvideo); 
route.put('/user/video/update', [mid.checkRolesAndLogout(['Super Admin'])], upload.single('video'), videoController.updatevideo); 

module.exports = route;