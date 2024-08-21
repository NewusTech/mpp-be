'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Surveyformnum extends Model {
    static associate(models) {
      Surveyformnum.belongsTo(models.Layanan, {
        foreignKey: 'layanan_id',
      });
      Surveyformnum.hasMany(models.Surveyforminput, {
        foreignKey: 'surveyformnum_id',
      });
      Surveyformnum.belongsTo(models.Userinfo, {
        foreignKey: 'userinfo_id',
      });
    }
  }
  Surveyformnum.init({
    no_skm: DataTypes.STRING,
    userinfo_id: DataTypes.INTEGER,
    layanan_id: DataTypes.INTEGER,
    date: DataTypes.STRING,
    kritiksaran: DataTypes.TEXT,
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    pekerjaan: DataTypes.STRING,
    telepon: DataTypes.STRING,
    alamat: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Surveyformnum',
  });
  return Surveyformnum;
};