const notificationsController = require('../controllers/notifications.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();
 
route.get('/notifications', [mid.checkRolesAndLogout(['User', 'Admin Instansi', 'Admin Layanan', 'Admin Verifikasi', 'Super Admin'])], notificationsController.getnotifications);
route.post('/notifications', notificationsController.postnotifications);
route.put('/notifications', [mid.checkRolesAndLogout(['User', 'Admin Instansi', 'Admin Layanan', 'Admin Verifikasi', 'Super Admin'])], notificationsController.updatenotifications); 
route.delete('/notifications', notificationsController.deletenotifications);

module.exports = route;