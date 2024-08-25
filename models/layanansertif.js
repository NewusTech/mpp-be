'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Layanansertif extends Model {
    static associate(models) {
      Layanansertif.belongsTo(models.Layanan, {
        foreignKey: 'layanan_id',
      });
    }
  }
  Layanansertif.init({
    layanan_id: DataTypes.INTEGER,
    header: DataTypes.STRING,
    body: DataTypes.STRING,
    footer: DataTypes.STRING,
    nomor: DataTypes.STRING,
    perihal: DataTypes.STRING,
    catatan: DataTypes.STRING,
    tembusan: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Layanansertif',
  });
  return Layanansertif;
};