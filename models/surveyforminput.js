'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Surveyforminput extends Model {
    static associate(models) {
      Surveyforminput.belongsTo(models.Surveyform, {
        foreignKey: 'surveyform_id',
      });
      Surveyforminput.belongsTo(models.Surveyformnum, {
        foreignKey: 'surveyformnum_id',
      });
    }
  }
  Surveyforminput.init({
    nilai: DataTypes.STRING,
    surveyform_id: DataTypes.INTEGER,
    surveyformnum_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Surveyforminput',
  });
  return Surveyforminput;
};