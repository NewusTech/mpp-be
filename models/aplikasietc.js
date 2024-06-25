'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Aplikasietcs extends Model {
    static associate(models) {
    }
  }
  Aplikasietcs.init({
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    image: DataTypes.STRING,
    link: DataTypes.STRING,
    desc: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'Aplikasietcs',
  });
  return Aplikasietcs;
};