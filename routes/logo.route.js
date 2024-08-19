const logoController = require('../controllers/logo.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
 
route.get('/user/logo/get', logoController.get);
route.put('/user/logo/update', [mid.checkRolesAndLogout(['Super Admin'])], upload.fields([{ name: 'logo_lamtim', maxCount: 1 }, { name: 'logo_mpp', maxCount: 1 }]), logoController.updatelogo);

module.exports = route;