'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Alerts tablosu
    await queryInterface.createTable('Alerts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Users tablosuna referans
          key: 'id'
        },
        onDelete: 'NO ACTION' // Cascade silme kaldırıldı
      },
      isResponded: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE, // Tarih ve zaman sütunu
        allowNull: false,
        defaultValue: Sequelize.NOW // Varsayılan olarak şu anki zamanı ayarla
      },
      isDeleted: { // Soft delete için sütun eklendi
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    });

    // AlertResponses tablosu
    await queryInterface.createTable('AlertResponses', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      alertId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Alerts', // Alerts tablosuna referans
          key: 'id'
        },
        onDelete: 'NO ACTION' // Cascade silme kaldırıldı
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Users tablosuna referans
          key: 'id'
        },
        onDelete: 'NO ACTION' // Cascade silme kaldırıldı
      },
      respondedAt: {
        type: Sequelize.DATE, // Tarih ve zaman sütunu
        allowNull: false,
        defaultValue: Sequelize.NOW // Varsayılan olarak şu anki zamanı ayarla
      },
      isDeleted: { // Soft delete için sütun eklendi
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Tabloları geri almak
    await queryInterface.dropTable('AlertResponses');
    await queryInterface.dropTable('Alerts');
  }
};
