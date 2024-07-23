const surveyforminput = require('../controllers/surveyforminput.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

route.post('/user/inputsurvey/create/:idlayanan', [mid.checkRolesAndLogout(['User'])], surveyforminput.inputsurvey);

//melihat detail survey user by id user
route.get('/user/inputsurvey/detail/:idsurveynum', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi', 'Admin Layanan', 'Super Admin', 'User'])], surveyforminput.getdetailsurveyform);

route.get('/user/historysurvey', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi', 'Admin Layanan', 'Super Admin'])], surveyforminput.gethistorysurveyuser);
route.get('/user/historysurvey/pdf', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi', 'Admin Layanan', 'Super Admin'])], surveyforminput.getPDFhistorysurveyuser);
route.get('/user/historysurvey/:idlayanan', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi', 'Admin Layanan', 'Super Admin'])], surveyforminput.getsurveybylayanan);
route.get('/user/historysurvey/:idlayanan/pdf', [mid.checkRolesAndLogout(['Admin Instansi', 'Admin Verifikasi', 'Admin Layanan', 'Super Admin'])], surveyforminput.getPDFsurveybylayanan);

route.get('/user/userhistorysurvey/', [mid.checkRolesAndLogout(['User'])], surveyforminput.gethistoryforuser);

module.exports = route;