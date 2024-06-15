'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Antrian extends Model {
    static associate(models) {
      Antrian.belongsTo(models.Instansi, {
        foreignKey: 'instansi_id',
      });
      Antrian.belongsTo(models.Layanan, {
        foreignKey: 'layanan_id',
      });
      Antrian.belongsTo(models.Userinfo, {
        foreignKey: 'userinfo_id',
      });
    }
  }
  Antrian.init({
    code: DataTypes.STRING,
    instansi_id: DataTypes.INTEGER,
    layanan_id: DataTypes.INTEGER,
    userinfo_id: DataTypes.INTEGER,
    status: DataTypes.BOOLEAN,
    qrcode: DataTypes.STRING,
    audio: DataTypes.STRING,
    tanggal: DataTypes.DATEONLY,
    waktu: DataTypes.TIME,
  }, {
    sequelize,
    modelName: 'Antrian',
  });
  return Antrian;
};