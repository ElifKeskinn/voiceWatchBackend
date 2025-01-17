require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'voicewatch_user',
    password: process.env.DB_PASSWORD || 'pass',
    database: process.env.DB_NAME || 'voicewatch',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 1433, //standart port
    dialect: process.env.DB_DIALECT || 'mssql',
    dialectOptions: {
      options: {
        encrypt: true, 
        trustServerCertificate: true, // Geliştirme aşamasında true kalsın
      },
    },
    logging: console.log, // SQL sorgularını görmek için
  },
  production: {
    // Üretim ortamı için yapılandırmalar
  },
};
