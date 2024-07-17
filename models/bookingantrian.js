'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bookingantrian extends Model {
    static associate(models) {
      Bookingantrian.belongsTo(models.Instansi, {
        foreignKey: 'instansi_id',
      });
      Bookingantrian.belongsTo(models.Layanan, {
        foreignKey: 'layanan_id',
      });
      Bookingantrian.belongsTo(models.Userinfo, {
        foreignKey: 'userinfo_id',
      });
    }
  }
  Bookingantrian.init({
    instansi_id: DataTypes.INTEGER,
    layanan_id: DataTypes.INTEGER,
    userinfo_id: DataTypes.INTEGER,
    qrkey: DataTypes.STRING,
    qrcode: DataTypes.STRING,
    tanggal: DataTypes.DATEONLY,
    waktu: DataTypes.TIME,
    status: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Bookingantrian',
  });
  return Bookingantrian;
};