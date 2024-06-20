'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Carousel extends Model {
    static associate(models) {
    }
  }
  Carousel.init({
    image: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Carousel',
  });
  return Carousel;
};