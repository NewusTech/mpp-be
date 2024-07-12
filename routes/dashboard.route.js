const dashboardController = require('../controllers/dashboard.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

route.get('/user/dashboard/webuser', dashboardController.web_user);
route.get('/user/dashboard/superadmin', [mid.checkRolesAndLogout(['Super Admin'])], dashboardController.web_superadmin); 
route.get('/user/dashboard/admindinas', [mid.checkRolesAndLogout(['Admin Instansi', 'Staff Instansi'])], dashboardController.web_admin_layanan); 
route.get('/user/dashboard/admindinas-survey', [mid.checkRolesAndLogout(['Admin Instansi', 'Staff Instansi'])], dashboardController.web_admin_survey); 

module.exports = route;