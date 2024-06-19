const statistikController = require('../controllers/statistik.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

route.get('/user/statistik', statistikController.get_statistik);

module.exports = route;