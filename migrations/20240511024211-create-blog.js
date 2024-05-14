//kode dari file xxxxxxxxxx-create-blog.js

'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Blogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      slug: {
        type: Sequelize.STRING
      },
      keyword: {
        type: Sequelize.STRING
      },
      excerpt: {
        type: Sequelize.STRING
      },
      body: {
        type: Sequelize.TEXT //CONTENT OF THE POST
      },
      kategoriblog_id: {
        type: Sequelize.INTEGER
      },
      tagblog_id: {
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      image: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.BOOLEAN
      },
      publishAt: {
        type: Sequelize.DATEONLY
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    //membuat foreign key
    await queryInterface.addConstraint('Blogs', {
      fields: ['kategoriblog_id'],
      type: 'foreign key',
      name: 'custom_fkey_kategoriblog_id',
      references: {
        table: 'Kategoriblogs',
        field: 'id'
      }
    });

    await queryInterface.addConstraint('Blogs', {
      fields: ['tagblog_id'],
      type: 'foreign key',
      name: 'custom_fkey_tagblog_id',
      references: {
        table: 'Tagblogs',
        field: 'id'
      }
    });

    await queryInterface.addConstraint('Blogs', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'custom_fkey_user_id',
      references: {
        table: 'Users',
        field: 'id'
      }
    });
  },

  //untuk drop table ketika melakukan revert migrations
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Blogs');
  }
};