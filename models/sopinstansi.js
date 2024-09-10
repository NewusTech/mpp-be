'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sopinstansi extends Model {
    static associate(models) {
      Sopinstansi.belongsTo(models.Instansi, {
        foreignKey: 'instansi_id',
      });
    }
  }
  Sopinstansi.init({
    file: DataTypes.STRING,
    name: DataTypes.STRING,
    desc: DataTypes.STRING,
    instansi_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Sopinstansi',
  });
  return Sopinstansi;
};