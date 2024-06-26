'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Kecamatan extends Model {
    static associate(models) {
      Kecamatan.hasMany(models.Userinfo, {
        foreignKey: 'kecamatan_id',
      });
    }
  }
  Kecamatan.init({
    name: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Kecamatan',
  });
  return Kecamatan;
};