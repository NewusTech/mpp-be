'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bukutamu extends Model {
    static associate(models) {
      Bukutamu.belongsTo(models.Instansi, {
        foreignKey: 'instansi_id',
      });
    }
  }
  Bukutamu.init({
    name: DataTypes.STRING,
    instansi_id: DataTypes.INTEGER,
    pekerjaan: DataTypes.STRING,
    alamat: DataTypes.STRING,
    tujuan: DataTypes.STRING,
    tanggal: DataTypes.DATE,
    waktu: DataTypes.TIME,
  }, {
    sequelize,
    modelName: 'Bukutamu',
  });
  return Bukutamu;
};