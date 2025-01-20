const { Sequelize } = require('sequelize');
const config = require('../config/config').development;

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    dialectOptions: config.dialectOptions,
    logging: config.logging,
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Modelleri yükle
db.User = require('./user')(sequelize, Sequelize);
db.Contact = require('./contact')(sequelize, Sequelize);
db.PasswordReset = require('./passwordReset')(sequelize, Sequelize);

// İlişkileri tanımla
db.User.hasMany(db.Contact, { as: 'emergencyContacts', foreignKey: 'userId' });
db.Contact.belongsTo(db.User, { foreignKey: 'userId' });

db.User.hasMany(db.PasswordReset, { as: 'passwordResets', foreignKey: 'userId' });
db.PasswordReset.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

module.exports = db;
