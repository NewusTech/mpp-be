'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Surveyform extends Model {
    static associate(models) {
      Surveyform.belongsTo(models.Instansi, {
        foreignKey: 'instansi_id',
      });
      // Surveyform.hasMany(models.Surveyforminput, {
      //   foreignKey: 'layananform_id',
      // });
    }
  }
  Surveyform.init({
    field: DataTypes.STRING,
    instansi_id: DataTypes.INTEGER,
    status: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Surveyform',
  });
  return Surveyform;
};