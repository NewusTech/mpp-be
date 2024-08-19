'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Maklumat extends Model {
    static associate(models) {
      Maklumat.belongsTo(models.Role, {
        foreignKey: 'role_id'
      });
    }
  }
  Maklumat.init({
    desc: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'Maklumat',
  });
  return Maklumat;
};