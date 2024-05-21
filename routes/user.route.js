//kode dari file user.route.js

//import controller user.controller.js 
const userController = require('../controllers/user.controller');

//import middleware dari auth.middleware.js
const mid = require('../middlewares/auth.middleware');

//express
const express = require('express');
const route = express.Router();

//membuat user baru route
route.post('/user/register', userController.createUser);

//membuat table baru route
// route.post('/user/table', //route 
// userController.createTable); //controller

//login user route
route.post('/user/login', userController.loginUser);

//logout user route
route.post('/user/logout', [mid.isLogin, mid.isLogout], userController.logoutUser); 

route.get('/user/alluser/get', [mid.isLogin, mid.isLogout], userController.getuser); 
route.get('/user/alluser/get/:id', [mid.isLogin, mid.isLogout], userController.getuserById); 
route.delete('/user/alluser/delete/:id', [mid.isLogin, mid.isLogout], userController.deleteuser);

module.exports = route;