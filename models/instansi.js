'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Instansi extends Model {
    static associate(models) {
      Instansi.hasMany(models.User, {
        foreignKey: 'instansi_id',
      });
      Instansi.hasMany(models.Layanan, {
        foreignKey: 'instansi_id',
      });
      Instansi.hasMany(models.Antrian, {
        foreignKey: 'instansi_id',
      });
    }
  }
  Instansi.init({
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    desc: DataTypes.STRING,
    image: DataTypes.STRING,
    status: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Instansi',
  });
  return Instansi;
};