'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      Role.hasMany(models.User, {
        foreignKey: 'role_id',
      });

      Role.hasMany(models.Manualbook, {
        foreignKey: 'role_id',
      });
    }
  }
  Role.init({
    name: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Role',
  });
  return Role;
};