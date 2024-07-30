const userController = require('../controllers/user.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

route.post('/user/register', userController.createUser);
route.post('/user/login', userController.loginUser);
route.post('/user/logout', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin', 'User'])], userController.logoutUser); 

// API UNTUK ADMIN / SUPER ADMIN
route.get('/user/alluser/get', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], userController.getuser); 
route.get('/user/alluser/get/:slug', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], userController.getuserByslug); 
route.delete('/user/alluser/delete/:slug', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], userController.deleteuser);

//API BUAT USER
route.get('/user/getforuser', [mid.checkRolesAndLogout(['User', 'Admin Instansi', 'Super Admin'])], userController.getforuser); 

route.post('/user/changepassword/:slug', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi', 'Admin Layanan', 'Super Admin', 'User'])], userController.changePassword); 

route.post('/user/forgotpassword', userController.forgotPassword); 

route.post('/user/reset/:token', userController.resetPassword); 

route.put('/user/permissions', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])],userController.updateUserpermissions);

route.get('/user/permissions/:userId', userController.getUserPermissions);

module.exports = route;