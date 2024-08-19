'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Maklumat extends Model {
    static associate(models) {
    }
  }
  Maklumat.init({
    desc: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'Maklumat',
  });
  return Maklumat;
};