//kode dari file user.route.js

//import controller user.controller.js 
const userController = require('../controllers/user.controller');

//import middleware dari auth.middleware.js
const mid = require('../middlewares/auth.middleware');

//express
const express = require('express');
const route = express.Router();

//membuat user baru route
route.post('/admin/register', //route 
userController.createUser); //controller

//login user route
route.post('/admin/login', //route
userController.loginUser); //controller

//logout user route
route.post('/admin/logout', //route
[mid.isLogin, mid.isLogout], //middleware isLogin dan isLogout digunakan untuk mengecek apakah user sudah login atau belum atau sudah logout atau belum
userController.logoutUser); //controller

module.exports = route;