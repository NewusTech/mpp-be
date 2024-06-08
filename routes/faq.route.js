const faqController = require('../controllers/faq.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

route.post('/user/faq/create', [mid.checkRolesAndLogout(['Super Admin'])], faqController.createfaq);
route.get('/user/faq/get', faqController.getfaq); 
route.get('/user/faq/get/:id', faqController.getfaqById); 
route.put('/user/faq/update/:id', [mid.checkRolesAndLogout(['Super Admin'])], faqController.updatefaq); 
route.delete('/user/faq/delete/:id', [mid.checkRolesAndLogout(['Super Admin'])], faqController.deletefaq);

module.exports = route;