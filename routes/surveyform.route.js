const surveyformController = require('../controllers/surveyform.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

route.post('/user/surveyform/create', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], surveyformController.createsurveyform);

route.get('/user/survey/form/:instansiid', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin', 'User'])], surveyformController.getsurveybydinas); 

route.put('/user/surveyform/update/:id', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], surveyformController.updatesurveyform); 
route.delete('/user/surveyform/delete/:id', [mid.checkRolesAndLogout(['Admin Instansi', 'Super Admin'])], surveyformController.deletesurveyform);

module.exports = route;