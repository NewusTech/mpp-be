'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Layanansurat extends Model {
    static associate(models) {
      Layanansurat.belongsTo(models.Layanan, {
        foreignKey: 'layanan_id',
      });
    }
  }
  Layanansurat.init({
    layanan_id: DataTypes.INTEGER,
    header: DataTypes.STRING,
    body: DataTypes.STRING,
    footer: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Layanansurat',
  });
  return Layanansurat;
};