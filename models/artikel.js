'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Artikel extends Model {
    static associate(models) {
    }
  }
  Artikel.init({
    title: DataTypes.STRING,
    slug: DataTypes.STRING,
    desc: DataTypes.STRING,
    image: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Artikel',
  });
  return Artikel;
};