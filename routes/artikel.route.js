const artikelController = require('../controllers/artikel.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/user/artikel/create', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], upload.single('image'), artikelController.createartikel);
route.get('/user/artikel/get', artikelController.getartikel); 
route.get('/user/artikel/get/:id', artikelController.getartikelById); 
route.put('/user/artikel/update/:id', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], upload.single('image'), artikelController.updateartikel); 
route.delete('/user/artikel/delete/:id', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], artikelController.deleteartikel);

module.exports = route;