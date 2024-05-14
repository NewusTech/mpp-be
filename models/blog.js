//kode dari file Blog.js

'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Blog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      //relasi dengan table admins
      Blog.belongsTo(models.Kategoriblog, {
        foreignKey: 'kategoriblog_id',
      });

      Blog.belongsTo(models.Tagblog, {
        foreignKey: 'tagblog_id',
      });

      Blog.belongsTo(models.User, {
        foreignKey: 'user_id',
      });
      
    }
  }
  Blog.init({
    title: DataTypes.STRING,
    slug: DataTypes.STRING,
    keyword: DataTypes.STRING,
    excerpt: DataTypes.STRING,
    body: DataTypes.TEXT,
    kategoriblog_id: DataTypes.INTEGER,
    tagblog_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    image: DataTypes.STRING,
    status: DataTypes.BOOLEAN,
    publishAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Blog',
  });
  return Blog;
};