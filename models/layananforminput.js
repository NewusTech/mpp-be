'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Layananforminput extends Model {
    static associate(models) {
      Layananforminput.belongsTo(models.Layananform, {
        foreignKey: 'layananform_id',
      });
      Layananforminput.belongsTo(models.Layananformnum, {
        foreignKey: 'layananformnum_id',
      });
    }
  }
  Layananforminput.init({
    data: DataTypes.STRING,
    layananform_id: DataTypes.INTEGER,
    layananformnum_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Layananforminput',
  });
  return Layananforminput;
};