'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Layananformnum extends Model {
    static associate(models) {
      Layananformnum.belongsTo(models.Layanan, {
        foreignKey: 'layanan_id',
      });
      Layananformnum.hasMany(models.Layananforminput, {
        foreignKey: 'layananformnum_id',
      });
    }
  }
  Layananformnum.init({
    userinfo_id: DataTypes.INTEGER,
    layanan_id: DataTypes.INTEGER,
    isonline: DataTypes.INTEGER,
    status: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Layananformnum',
  });
  return Layananformnum;
};