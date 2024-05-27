const layananformController = require('../controllers/layananform.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

//get from by layanan
route.get('/user/layanan/form/:layananid', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], layananformController.getformbylayanan); 

route.post('/user/layananform/create', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], layananformController.createlayananform);
route.put('/user/layananform/update/:id', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], layananformController.updatelayananform); 
route.delete('/user/layananform/delete/:id', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], layananformController.deletelayananform);

//get from docs by layanan
route.get('/user/layanan/docs/:layananid', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], layananformController.getdocsbylayanan); 

route.post('/user/layanandocs/create', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], layananformController.createlayanandocs);
route.put('/user/layanandocs/update/:id', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], layananformController.updatelayanandocs); 

//get semua from --> gak bakal kepake
route.get('/user/layananform/get', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], layananformController.getlayananform); 
//get form by id --> gak bakal kepake
route.get('/user/layananform/get/:id', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], layananformController.getlayananformById); 


module.exports = route;