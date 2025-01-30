require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'voicewatch_user',
    password: process.env.DB_PASSWORD || 'pass',
    database: process.env.DB_NAME || 'voicewatch',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432, //standart port
    dialect: process.env.DB_DIALECT || 'postgres',
    dialectOptions: {
    },
    logging: console.log, // SQL sorgularını görmek için
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || 'postgres',
    dialectOptions: {
      ssl: {
        require: true, // Railway genellikle SSL 
        rejectUnauthorized: false, // Sertifika doğrulaması için
      },
    },
    logging: false, 
  },
};