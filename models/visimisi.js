'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Visimisi extends Model {
    static associate(models) {
    }
  }
  Visimisi.init({
    visi: DataTypes.STRING,
    misi: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Visimisi',
  });
  return Visimisi;
};