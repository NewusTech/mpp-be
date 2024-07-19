'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Manualbook extends Model {
    static associate(models) {
    }
  }
  Manualbook.init({
    dokumen: DataTypes.STRING,
    video: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Manualbook',
  });
  return Manualbook;
};