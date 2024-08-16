'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Apkinstansi extends Model {
    static associate(models) {
      Apkinstansi.belongsTo(models.Instansi, {
        foreignKey: 'instansi_id',
      });
    }
  }
  Apkinstansi.init({
    name: DataTypes.STRING,
    file: DataTypes.STRING,
    link: DataTypes.STRING,
    desc: DataTypes.TEXT,
    instansi_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Apkinstansi',
  });
  return Apkinstansi;
};