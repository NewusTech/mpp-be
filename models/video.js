'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Video extends Model {
    static associate(models) {
    }
  }
  Video.init({
    video: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Video',
  });
  return Video;
};