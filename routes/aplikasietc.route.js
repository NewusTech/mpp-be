const aplikasietcController = require('../controllers/aplikasietc.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/user/aplikasietc/create', [mid.checkRolesAndLogout(['Super Admin'])], upload.single('image'), aplikasietcController.createAplikasietcs);
route.get('/user/aplikasietc/get', aplikasietcController.getAplikasietcs); 
route.get('/user/aplikasietc/get/:slug', aplikasietcController.getAplikasietcsBySlug); 
route.put('/user/aplikasietc/update/:slug', [mid.checkRolesAndLogout(['Super Admin'])], upload.single('image'), aplikasietcController.updateAplikasietcs); 
route.delete('/user/aplikasietc/delete/:slug', [mid.checkRolesAndLogout(['Super Admin'])], aplikasietcController.deleteAplikasietcs);

module.exports = route;