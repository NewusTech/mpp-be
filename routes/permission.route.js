//kode dari file permission.route.js

//import controller user.controller.js 
const permissionController = require('../controllers/permission.controller');

//import middleware dari auth.middleware.js
const mid = require('../middlewares/auth.middleware');

//express
const express = require('express');
const route = express.Router();

route.post('/user/permission/create', [mid.checkRolesAndLogout(['Super Admin', 'Admin Instansi'])], permissionController.createpermission);
route.get('/user/permission/get', [mid.checkRolesAndLogout(['Super Admin', 'Admin Instansi'])], permissionController.getpermission); 
route.get('/user/permission/get/:id', [mid.checkRolesAndLogout(['Super Admin', 'Admin Instansi'])], permissionController.getpermissionById); 
route.put('/user/permission/update/:id', [mid.checkRolesAndLogout(['Super Admin', 'Admin Instansi'])], permissionController.updatepermission); 
route.delete('/user/permission/delete/:id', [mid.checkRolesAndLogout(['Super Admin', 'Admin Instansi'])], permissionController.deletepermission);

module.exports = route;