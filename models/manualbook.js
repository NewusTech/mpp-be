'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Manualbook extends Model {
    static associate(models) {
      Manualbook.belongsTo(models.Role, {
        foreignKey: 'role_id'
      });
    }
  }
  Manualbook.init({
    dokumen: DataTypes.STRING,
    video: DataTypes.STRING,
    role_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Manualbook',
  });
  return Manualbook;
};