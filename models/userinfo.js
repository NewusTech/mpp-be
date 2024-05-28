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
    }
  }
  Userinfo.init({
    name: DataTypes.STRING,
    nik: DataTypes.STRING,
    email: DataTypes.STRING,
    telepon: DataTypes.STRING,
    kec: DataTypes.STRING,
    desa: DataTypes.STRING,
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
    fileijazahlain: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Userinfo',
  });
  return Userinfo;
};