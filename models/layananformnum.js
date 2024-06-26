'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Layananformnum extends Model {
    static associate(models) {
      Layananformnum.belongsTo(models.Layanan, {
        foreignKey: 'layanan_id',
      });
      Layananformnum.hasMany(models.Layananforminput, {
        foreignKey: 'layananformnum_id',
      });
      Layananformnum.belongsTo(models.Userinfo, {
        foreignKey: 'userinfo_id',
      });
    }
  }
  Layananformnum.init({
    userinfo_id: DataTypes.INTEGER,
    layanan_id: DataTypes.INTEGER,
    fileoutput: DataTypes.STRING,
    pesan: DataTypes.STRING,
    tgl_selesai: DataTypes.DATEONLY,
    isonline: DataTypes.INTEGER,
    status: DataTypes.SMALLINT,
  }, {
    sequelize,
    modelName: 'Layananformnum',
  });
  return Layananformnum;
};