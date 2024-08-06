const userinfoController = require('../controllers/userinfo.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.get('/user/alluserinfo/get', [mid.checkRolesAndLogout(['Super Admin', 'Admin Instansi', 'Admin Verifikasi', 'Admin Layanan', 'User'])], userinfoController.getuserdata); 
route.get('/user/alluserinfo/get/:slug', [mid.checkRolesAndLogout(['Super Admin', 'User', 'Admin Instansi', 'Admin Verifikasi', 'Admin Layanan'])], userinfoController.getuserByslug); 
route.delete('/user/alluserinfo/delete/:slug', [mid.checkRolesAndLogout(['Super Admin'])], userinfoController.deleteuser);

route.post('/user/userinfo/create', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi', 'Admin Layanan', 'Super Admin'])], upload.fields([
    { name: 'foto', maxCount: 1 },
    { name: 'aktalahir', maxCount: 1 },
    { name: 'filektp', maxCount: 1 },
    { name: 'filekk', maxCount: 1 },
    { name: 'fileijazahsd', maxCount: 1 },
    { name: 'fileijazahsmp', maxCount: 1 },
    { name: 'fileijazahsma', maxCount: 1 },
    { name: 'fileijazahlain', maxCount: 1 }
]), userinfoController.createuserinfo); 
route.put('/user/userinfo/update/:slug', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi', 'Admin Layanan', 'Super Admin', 'User'])], userinfoController.updateuserinfo);
route.put('/user/userinfo/updatedocs/:slug', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi', 'Admin Layanan', 'Super Admin', 'User'])], upload.fields([
    { name: 'foto', maxCount: 1 },
    { name: 'aktalahir', maxCount: 1 },
    { name: 'filektp', maxCount: 1 },
    { name: 'filekk', maxCount: 1 },
    { name: 'fileijazahsd', maxCount: 1 },
    { name: 'fileijazahsmp', maxCount: 1 },
    { name: 'fileijazahsma', maxCount: 1 },
    { name: 'fileijazahlain', maxCount: 1 }
]), userinfoController.updateuserdocs);

route.put('/user/userinfo/updatefoto/:slug', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi', 'Admin Layanan', 'Super Admin', 'User'])], upload.single('fotoprofil'), userinfoController.updateprofil); 

module.exports = route;