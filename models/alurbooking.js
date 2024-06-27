'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Alurbooking extends Model {
    static associate(models) {
    }
  }
  Alurbooking.init({
    desc: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Alurbooking',
  });
  return Alurbooking;
};