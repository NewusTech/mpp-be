const userinfoController = require('../controllers/userinfo.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.get('/user/alluserinfo/get', [mid.checkRolesAndLogout(['Super Admin'])], userinfoController.getuserdata); 
route.get('/user/alluserinfo/get/:slug', [mid.checkRolesAndLogout(['Super Admin', 'User'])], userinfoController.getuserByslug); 
route.delete('/user/alluserinfo/delete/:slug', [mid.checkRolesAndLogout(['Super Admin'])], userinfoController.deleteuser);

route.post('/user/userinfo/create', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi', 'Super Admin'])], upload.fields([
    { name: 'foto', maxCount: 1 },
    { name: 'aktalahir', maxCount: 1 },
    { name: 'filektp', maxCount: 1 },
    { name: 'filekk', maxCount: 1 },
    { name: 'fileijazahsd', maxCount: 1 },
    { name: 'fileijazahsmp', maxCount: 1 },
    { name: 'fileijazahsma', maxCount: 1 },
    { name: 'fileijazahlain', maxCount: 1 }
]), userinfoController.createuserinfo); 
route.put('/user/userinfo/update/:slug', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi', 'Super Admin', 'User'])], userinfoController.updateuserinfo);
route.put('/user/userinfo/updatedocs/:slug', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi', 'Super Admin', 'User'])], upload.fields([
    { name: 'foto', maxCount: 1 },
    { name: 'aktalahir', maxCount: 1 },
    { name: 'filektp', maxCount: 1 },
    { name: 'filekk', maxCount: 1 },
    { name: 'fileijazahsd', maxCount: 1 },
    { name: 'fileijazahsmp', maxCount: 1 },
    { name: 'fileijazahsma', maxCount: 1 },
    { name: 'fileijazahlain', maxCount: 1 }
]), userinfoController.updateuserdocs);

module.exports = route;