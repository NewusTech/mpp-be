//kode dari file Kategoriblog.js

'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Kategoriblog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      //relasi dengan table items
      Kategoriblog.hasMany(models.Blog, {
        foreignKey: 'kategoriblog_id',
      });
    }

  }
  Kategoriblog.init({
    title: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Kategoriblog',
  });
  return Kategoriblog;
};