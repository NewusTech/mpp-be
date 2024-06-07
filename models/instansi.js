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
      Instansi.hasMany(models.Surveyform, {
        foreignKey: 'instansi_id',
      });
    }
  }
  Instansi.init({
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    alamat: DataTypes.STRING,
    telp: DataTypes.STRING,
    desc: DataTypes.STRING,
    pj: DataTypes.STRING,
    nip_pj: DataTypes.STRING,
    image: DataTypes.STRING,
    active_online: DataTypes.BOOLEAN,
    active_offline: DataTypes.BOOLEAN,
    status: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Instansi',
  });
  return Instansi;
};