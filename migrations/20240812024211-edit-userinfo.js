'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('Userinfos', {
      fields: ['nik'],
      type: 'unique',
      name: 'unique_nik2'
    });
    
    await queryInterface.addConstraint('Userinfos', {
      fields: ['email'],
      type: 'unique',
      name: 'unique_email2'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Userinfos', 'unique_nik');
    await queryInterface.removeConstraint('Userinfos', 'unique_email');
  }
};
