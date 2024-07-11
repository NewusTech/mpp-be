'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Alurmpp extends Model {
    static associate(models) {
    }
  }
  Alurmpp.init({
    image: DataTypes.STRING,
    title: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Alurmpp',
  });
  return Alurmpp;
};