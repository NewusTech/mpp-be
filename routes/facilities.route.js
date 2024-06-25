const FacilitiesController = require('../controllers/facilities.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/user/Facilities/create', [mid.checkRolesAndLogout(['Super Admin'])], upload.single('image'), FacilitiesController.createFacilities);
route.get('/user/Facilities/get', FacilitiesController.getFacilities); 
route.get('/user/Facilities/get/:slug', FacilitiesController.getFacilitiesBySlug); 
route.put('/user/Facilities/update/:slug', [mid.checkRolesAndLogout(['Super Admin'])], upload.single('image'), FacilitiesController.updateFacilities); 
route.delete('/user/Facilities/delete/:slug', [mid.checkRolesAndLogout(['Super Admin'])], FacilitiesController.deleteFacilities);

module.exports = route;