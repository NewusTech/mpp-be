const surveyformController = require('../controllers/surveyform.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

route.post('/user/surveyform/create', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], surveyformController.createsurveyform);
route.post('/user/surveyform/createmulti', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], surveyformController.createmultisurveyform);

route.get('/user/survey/form/:instansiid', [mid.checkRolesAndLogout(['Admin Instansi', 'Staff Instansi', 'Super Admin', 'User'])], surveyformController.getsurveybydinas); 
route.get('/user/survey/formbyid/:idsurvey', [mid.checkRolesAndLogout(['Admin Instansi', 'Staff Instansi', 'Super Admin', 'User'])], surveyformController.getsurveybyidsurvey); 

route.put('/user/surveyform/update/:id', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], surveyformController.updatesurveyform); 
route.put('/user/surveyform/updatemulti', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], surveyformController.updatemultisurveyform); 

route.delete('/user/surveyform/delete/:id', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], surveyformController.deletesurveyform);

module.exports = route;