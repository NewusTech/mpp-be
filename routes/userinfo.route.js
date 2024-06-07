const userinfoController = require('../controllers/userinfo.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.get('/user/alluserinfo/get', [mid.checkRolesAndLogout(['Super Admin'])], userinfoController.getuserdata); 
route.get('/user/alluserinfo/get/:id', [mid.checkRolesAndLogout(['Super Admin'])], userinfoController.getuserById); 
route.delete('/user/alluserinfo/delete/:id', [mid.checkRolesAndLogout(['Super Admin'])], userinfoController.deleteuser);

route.post('/user/userinfo/create', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], upload.fields([
    { name: 'filektp', maxCount: 1 },
    { name: 'filekk', maxCount: 1 },
    { name: 'fileijazahsd', maxCount: 1 },
    { name: 'fileijazahsmp', maxCount: 1 },
    { name: 'fileijazahsma', maxCount: 1 },
    { name: 'fileijazahlain', maxCount: 1 }
]), userinfoController.createuserinfo); 
route.put('/user/userinfo/update/:id', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin', 'User'])], userinfoController.updateuserinfo);
route.put('/user/userinfo/updatedocs/:id', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin', 'User'])], upload.fields([
    { name: 'filektp', maxCount: 1 },
    { name: 'filekk', maxCount: 1 },
    { name: 'fileijazahsd', maxCount: 1 },
    { name: 'fileijazahsmp', maxCount: 1 },
    { name: 'fileijazahsma', maxCount: 1 },
    { name: 'fileijazahlain', maxCount: 1 }
]), userinfoController.updateuserdocs);

module.exports = route;