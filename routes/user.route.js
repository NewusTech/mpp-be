const userController = require('../controllers/user.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

route.post('/user/register', userController.createUser);
route.post('/user/login', userController.loginUser);
route.post('/user/logout', [mid.checkRolesAndLogout(['User'])], userController.logoutUser); 

route.get('/user/alluser/get', [mid.checkRolesAndLogout(['User'])], userController.getuser); 
route.get('/user/alluser/get/:id', [mid.checkRolesAndLogout(['User'])], userController.getuserById); 
route.delete('/user/alluser/delete/:id', [mid.checkRolesAndLogout(['User'])], userController.deleteuser);

module.exports = route;