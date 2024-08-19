'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sop extends Model {
    static associate(models) {
    }
  }
  Sop.init({
    file: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Sop',
  });
  return Sop;
};