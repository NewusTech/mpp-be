'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Userinfo extends Model {
    static associate(models) {
      Userinfo.hasOne(models.User, {
        foreignKey: 'userinfo_id',
      });
      Userinfo.hasMany(models.Surveyformnum, {
        foreignKey: 'userinfo_id',
      });
      Userinfo.hasMany(models.Layananformnum, {
        foreignKey: 'userinfo_id',
      });
      Userinfo.belongsTo(models.Kecamatan, {
        foreignKey: 'kecamatan_id',
      });
      Userinfo.belongsTo(models.Desa, {
        foreignKey: 'desa_id',
      });
    }
  }
  Userinfo.init({
    name: DataTypes.STRING,
    nik: DataTypes.STRING,
    slug: DataTypes.STRING,
    email: DataTypes.STRING,
    telepon: DataTypes.STRING,
    kecamatan_id: DataTypes.INTEGER,
    desa_id: DataTypes.INTEGER,
    rt: DataTypes.STRING,
    rw: DataTypes.STRING,
    alamat: DataTypes.STRING,
    agama: DataTypes.INTEGER,
    tempat_lahir: DataTypes.STRING,
    tgl_lahir: DataTypes.DATEONLY,
    status_kawin: DataTypes.SMALLINT,
    gender: DataTypes.SMALLINT,
    pekerjaan: DataTypes.STRING,
    goldar: DataTypes.SMALLINT,
    pendidikan: DataTypes.SMALLINT,
    filektp: DataTypes.STRING,
    filekk: DataTypes.STRING,
    fileijazahsd: DataTypes.STRING,
    fileijazahsmp: DataTypes.STRING,
    fileijazahsma: DataTypes.STRING,
    fileijazahlain: DataTypes.STRING,
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Userinfo',
  });
  return Userinfo;
};