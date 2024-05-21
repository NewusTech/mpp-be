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
    }
  }
  Layanan.init({
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    desc: DataTypes.STRING,
    image: DataTypes.STRING,
    instansi_id: DataTypes.INTEGER,
    status: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Layanan',
  });
  return Layanan;
};