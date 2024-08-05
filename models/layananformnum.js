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
      Layananformnum.belongsTo(models.Userinfo, {
        foreignKey: 'updated_by',
        as: 'Adminupdate'
      });
    }
  }
  Layananformnum.init({
    userinfo_id: DataTypes.INTEGER,
    no_request: DataTypes.STRING,
    layanan_id: DataTypes.INTEGER,
    fileoutput: DataTypes.STRING,
    pesan: DataTypes.STRING,
    tgl_selesai: DataTypes.DATEONLY,
    isonline: DataTypes.INTEGER,
    status: DataTypes.SMALLINT,
    updated_by: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Layananformnum',
  });
  return Layananformnum;
};