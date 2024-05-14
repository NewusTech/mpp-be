//kode dari file Tagblog.js

'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tagblog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      //relasi dengan table items
      Tagblog.hasMany(models.Blog, {
        foreignKey: 'tagblog_id',
      });
    }
  }
  Tagblog.init({
    title: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Tagblog',
  });
  return Tagblog;
};