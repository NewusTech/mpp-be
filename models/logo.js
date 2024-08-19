'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Logo extends Model {
    static associate(models) {
    }
  }
  Logo.init({
    logo_mpp: DataTypes.STRING,
    logo_lamtim: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Logo',
  });
  return Logo;
};