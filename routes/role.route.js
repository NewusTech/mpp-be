//kode dari file role.route.js

//import controller user.controller.js 
const roleController = require('../controllers/role.controller');

//import middleware dari auth.middleware.js
const mid = require('../middlewares/auth.middleware');

//express
const express = require('express');
const route = express.Router();

route.post('/user/role/create', [mid.isLogin, mid.isLogout], roleController.createrole);
route.get('/user/role/get', [mid.isLogin, mid.isLogout], roleController.getrole); 
route.get('/user/role/get/:id', [mid.isLogin, mid.isLogout], roleController.getroleById); 
route.put('/user/role/update/:id', [mid.isLogin, mid.isLogout], roleController.updaterole); 
route.delete('/user/role/delete/:id', [mid.isLogin, mid.isLogout], roleController.deleterole);

module.exports = route;