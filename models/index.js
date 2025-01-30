const { Sequelize } = require('sequelize');
const config = require('../config/config')[process.env.NODE_ENV || 'development'];

let sequelize;

if (process.env.NODE_ENV === 'production') {
  if (!config.url) {
    throw new Error('DATABASE_URL is not defined in the production environment');
  }
  console.log('Connecting to production database with URL:', config.url);
  sequelize = new Sequelize(config.url, {
    dialect: config.dialect,
    dialectOptions: config.dialectOptions,
    logging: config.logging,
  });
} else {
  console.log('Connecting to development database:', config.database);
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
      host: config.host,
      dialect: config.dialect,
      port: config.port,
      logging: config.logging,
    }
  );
}

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Modelleri yükle
db.User = require('./user')(sequelize, Sequelize);
db.Contact = require('./contact')(sequelize, Sequelize);
db.PasswordReset = require('./passwordReset')(sequelize, Sequelize);
db.Alert = require('./alert')(sequelize, Sequelize);
db.AlertResponse = require('./alertResponse')(sequelize, Sequelize);

// İlişkileri tanımla
// EmergencyContacts
db.User.hasMany(db.Contact, { as: 'emergencyContacts', foreignKey: 'userId', onDelete: 'NO ACTION' });
db.Contact.belongsTo(db.User, { foreignKey: 'userId', onDelete: 'NO ACTION' });

// PasswordResets
db.User.hasMany(db.PasswordReset, { as: 'passwordResets', foreignKey: 'userId', onDelete: 'NO ACTION' });
db.PasswordReset.belongsTo(db.User, { foreignKey: 'userId', as: 'user', onDelete: 'NO ACTION' });

// Alerts
db.User.hasMany(db.Alert, { as: 'alerts', foreignKey: 'userId', onDelete: 'NO ACTION' });
db.Alert.belongsTo(db.User, { foreignKey: 'userId', as: 'user', onDelete: 'NO ACTION' });

db.Alert.hasMany(db.AlertResponse, { as: 'responses', foreignKey: 'alertId', onDelete: 'NO ACTION' });
db.AlertResponse.belongsTo(db.Alert, { foreignKey: 'alertId', as: 'alert', onDelete: 'NO ACTION' });

db.AlertResponse.belongsTo(db.User, { foreignKey: 'userId', as: 'user', onDelete: 'NO ACTION' });

module.exports = db;
