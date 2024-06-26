'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Facilities extends Model {
    static associate(models) {
    }
  }
  Facilities.init({
    title: DataTypes.STRING,
    slug: DataTypes.STRING,
    image: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Facilities',
  });
  return Facilities;
};