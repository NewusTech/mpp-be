'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Termcond extends Model {
    static associate(models) {
    }
  }
  Termcond.init({
    desc: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Termcond',
  });
  return Termcond;
};