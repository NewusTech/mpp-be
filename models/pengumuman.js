'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pengumuman extends Model {
    static associate(models) {
    }
  }
  Pengumuman.init({
    file: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Pengumuman',
  });
  return Pengumuman;
};