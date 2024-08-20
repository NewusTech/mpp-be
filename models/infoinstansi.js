'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Infoinstansi extends Model {
    static associate(models) {
      Infoinstansi.belongsTo(models.Instansi, {
        foreignKey: 'instansi_id',
      });
    }
  }
  Infoinstansi.init({
    instansi_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    image: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Infoinstansi',
  });
  return Infoinstansi;
};