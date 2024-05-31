const surveyforminput = require('../controllers/surveyforminput.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

route.post('/user/inputsurvey/create/:idlayanan', [mid.checkRolesAndLogout(['User'])], surveyforminput.inputsurvey);

//melihat detail survey user by id user
route.get('/user/inputsurvey/detail/:idsurveynum', [mid.checkRolesAndLogout(['User'])], surveyforminput.getdetailsurveyform);

route.get('/user/historysurvey', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin', 'User'])], surveyforminput.gethistorysurveyuser);
route.get('/user/historysurvey/:idlayanan', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin', 'User'])], surveyforminput.getsurveybylayanan);

module.exports = route;