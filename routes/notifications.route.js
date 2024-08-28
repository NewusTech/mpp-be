const notificationsController = require('../controllers/notifications.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();
 
route.get('/notifications', notificationsController.getnotifications);
route.post('/notifications', notificationsController.postnotifications); 
route.delete('/notifications', notificationsController.deletenotifications);

module.exports = route;