'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Layanan extends Model {
    static associate(models) {
      Layanan.belongsTo(models.Instansi, {
        foreignKey: 'instansi_id',
      });
      Layanan.hasMany(models.Layananform, {
        foreignKey: 'layanan_id',
      });
      Layanan.hasOne(models.Layanansurat, {
        foreignKey: 'layanan_id',
      });
      Layanan.hasMany(models.Surveyformnum, {
        foreignKey: 'layanan_id',
      });
      Layanan.hasMany(models.Layananformnum, {
        foreignKey: 'layanan_id',
      });
    }
  }
  Layanan.init({
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    desc: DataTypes.TEXT,
    dasarhukum: DataTypes.TEXT,
    syarat: DataTypes.TEXT,
    image: DataTypes.STRING,
    instansi_id: DataTypes.INTEGER,
    active_online: DataTypes.BOOLEAN,
    active_offline: DataTypes.BOOLEAN,
    status: DataTypes.BOOLEAN,
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Layanan',
  });
  return Layanan;
};