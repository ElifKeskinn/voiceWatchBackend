require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'voicewatch_user',
    password: process.env.DB_PASSWORD || 'pass',
    database: process.env.DB_NAME || 'voicewatch',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: console.log,
  },
  production: {
    url: process.env.DATABASE_URL, 
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  },
};
