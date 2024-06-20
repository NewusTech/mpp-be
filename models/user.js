'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Instansi, {
        foreignKey: 'instansi_id',
      });

      User.belongsTo(models.Role, {
        foreignKey: 'role_id',
      });

      User.belongsTo(models.Userinfo, {
        foreignKey: 'userinfo_id',
      });
    }
  }
  User.init({
    password: DataTypes.STRING,
    slug: DataTypes.STRING,
    instansi_id: DataTypes.INTEGER,
    role_id: DataTypes.INTEGER,
    userinfo_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};