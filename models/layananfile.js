'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Layananfile extends Model {
    static associate(models) {
      Layananfile.belongsTo(models.Layanan, {
        foreignKey: 'layanan_id',
      });
    }
  }
  Layananfile.init({
    layanan_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    file: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Layananfile',
  });
  return Layananfile;
};