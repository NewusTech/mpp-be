'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pengaduan extends Model {
    static associate(models) {
      Pengaduan.belongsTo(models.Instansi, {
        foreignKey: 'instansi_id',
      });
      Pengaduan.belongsTo(models.Layanan, {
        foreignKey: 'layanan_id',
      });
      Pengaduan.belongsTo(models.Userinfo, {
        foreignKey: 'userinfo_id',
      });
      Pengaduan.belongsTo(models.Userinfo, {
        foreignKey: 'admin_id',
        as: 'Admin'
      });
      Pengaduan.belongsTo(models.Userinfo, {
        foreignKey: 'updated_by',
        as: 'Adminupdate'
      });
    }
  }
  Pengaduan.init({
    instansi_id: DataTypes.INTEGER,
    layanan_id: DataTypes.INTEGER,
    userinfo_id: DataTypes.INTEGER,
    admin_id: DataTypes.INTEGER,
    status: DataTypes.SMALLINT,
    aduan: DataTypes.STRING,
    judul: DataTypes.STRING,
    jawaban: DataTypes.STRING,
    image: DataTypes.STRING,
    updated_by: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Pengaduan',
  });
  return Pengaduan;
};