//kode dari file Tagportofolio.js

'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tagportofolio extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

  }
  Tagportofolio.init({
    title: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Tagportofolio',
  });
  return Tagportofolio;
};