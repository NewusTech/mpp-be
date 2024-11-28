"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Instansi extends Model {
    static associate(models) {
      Instansi.hasMany(models.User, {
        foreignKey: "instansi_id",
      });
      Instansi.hasMany(models.Layanan, {
        foreignKey: "instansi_id",
      });
      Instansi.hasMany(models.Apkinstansi, {
        foreignKey: "instansi_id",
      });
      Instansi.hasMany(models.Sopinstansi, {
        foreignKey: "instansi_id",
      });
      Instansi.hasMany(models.Artikel, {
        foreignKey: "instansi_id",
      });
      Instansi.hasMany(models.Antrian, {
        foreignKey: "instansi_id",
      });
      Instansi.hasOne(models.Infoinstansi, {
        foreignKey: "instansi_id",
      });
      Instansi.hasMany(models.Bookingantrian, {
        foreignKey: "instansi_id",
      });
      Instansi.hasMany(models.Surveyform, {
        foreignKey: "instansi_id",
      });
    }
  }
  Instansi.init(
    {
      name: DataTypes.STRING,
      slug: DataTypes.STRING,
      code: DataTypes.STRING,
      alamat: DataTypes.STRING,
      telp: DataTypes.STRING,
      website: DataTypes.STRING,
      email: DataTypes.STRING,
      gelar: DataTypes.STRING,
      jabatan: DataTypes.STRING,
      desc: DataTypes.TEXT,
      pj: DataTypes.STRING,
      nip_pj: DataTypes.STRING,
      image: DataTypes.STRING,
      linkmaps: DataTypes.STRING,
      active_online: DataTypes.BOOLEAN,
      active_offline: DataTypes.BOOLEAN,
      status: DataTypes.BOOLEAN,
      jam_buka: DataTypes.TIME,
      jam_tutup: DataTypes.TIME,
      deletedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Instansi",
    }
  );
  return Instansi;
};
