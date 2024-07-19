const termcondController = require('../controllers/termcond.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
 
route.get('/user/termcond/get', termcondController.gettermcond); 
route.put('/user/termcond/update', [mid.checkRolesAndLogout(['Super Admin'])], upload.fields([{ name: 'desc', maxCount: 1 }, { name: 'privasi', maxCount: 1 }]), termcondController.updatetermcond); 

module.exports = route;