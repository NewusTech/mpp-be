const artikelController = require('../controllers/artikel.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/user/artikel/create', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], upload.single('image'), artikelController.createartikel);
route.get('/user/artikel/get', artikelController.getartikel); 
route.get('/user/artikel/get/:slug', artikelController.getartikelBySlug); 
route.put('/user/artikel/update/:slug', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], upload.single('image'), artikelController.updateartikel); 
route.delete('/user/artikel/delete/:slug', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], artikelController.deleteartikel);

module.exports = route;