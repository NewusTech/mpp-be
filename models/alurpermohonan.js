'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Alurpermohonan extends Model {
    static associate(models) {
    }
  }
  Alurpermohonan.init({
    desc: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Alurpermohonan',
  });
  return Alurpermohonan;
};