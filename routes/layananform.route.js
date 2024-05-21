const layananformController = require('../controllers/layananform.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

route.post('/user/layananform/create', [mid.isLogin, mid.isLogout], layananformController.createlayananform);
route.get('/user/layananform/get', [mid.isLogin, mid.isLogout], layananformController.getlayananform); 
route.get('/user/layananform/get/:id', [mid.isLogin, mid.isLogout], layananformController.getlayananformById); 
route.put('/user/layananform/update/:id', [mid.isLogin, mid.isLogout], layananformController.updatelayananform); 
route.delete('/user/layananform/delete/:id', [mid.isLogin, mid.isLogout], layananformController.deletelayananform);

module.exports = route;