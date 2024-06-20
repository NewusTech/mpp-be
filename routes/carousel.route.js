const CarouselController = require('../controllers/carousel.controller');

const mid = require('../middlewares/auth.middleware');

const express = require('express');
const route = express.Router();

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

route.post('/user/Carousel/create', [mid.checkRolesAndLogout(['Super Admin'])], upload.single('image'), CarouselController.createCarousel);
route.get('/user/Carousel/get', CarouselController.getCarousel); 
route.get('/user/Carousel/get/:id', CarouselController.getCarouselById); 
route.put('/user/Carousel/update/:id', [mid.checkRolesAndLogout(['Super Admin'])], upload.single('image'), CarouselController.updateCarousel); 
route.delete('/user/Carousel/delete/:id', [mid.checkRolesAndLogout(['Super Admin'])], CarouselController.deleteCarousel);

module.exports = route;