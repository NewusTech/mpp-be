'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Layananform extends Model {
    static associate(models) {
      Layananform.belongsTo(models.Layanan, {
        foreignKey: 'layanan_id',
      });
    }
  }
  Layananform.init({
    field: DataTypes.STRING,
    tipedata: DataTypes.STRING,
    maxinput: DataTypes.INTEGER,
    mininput: DataTypes.INTEGER,
    layanan_id: DataTypes.INTEGER,
    isrequired: DataTypes.INTEGER,
    status: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Layananform',
  });
  return Layananform;
};