'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Artikel extends Model {
    static associate(models) {
      Artikel.belongsTo(models.Instansi, {
        foreignKey: 'instansi_id',
      });
    }
  }
  Artikel.init({
    title: DataTypes.STRING,
    slug: DataTypes.STRING,
    desc: DataTypes.TEXT,
    instansi_id: DataTypes.INTEGER,
    image: DataTypes.STRING,
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Artikel',
  });
  return Artikel;
};