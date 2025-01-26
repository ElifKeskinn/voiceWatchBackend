const express = require('express');
const dotenv = require('dotenv');
const db = require('./models'); // Sequelize modelleri
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const contactRoutes = require('./routes/contactRoutes');
const alertRoutes = require('./routes/alertRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Swagger Ayarları
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VoiceWatch API',
      version: '1.0.0',
      description: 'VoiceWatch Backend API Dokümantasyonu',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'], // Swagger yorumlarının bulunduğu dosya yolu
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/alert', alertRoutes);

// // test endpointi http://localhost:5000/ ile test edilebilir swagger ekranı için http://localhost:5000/api-docs/
app.get('/', (req, res) => {
  res.send('VoiceWatch Backend API is running.');
});

// Hata Yönetimi Middleware 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Veritabanı bağlantısını test et ve senkronize et
db.sequelize.authenticate()
  .then(() => {
    console.log('Database connected...');
    return db.sequelize.sync(); // { force: true } opsiyonel, veritabanını yeniden oluşturur
  })
  .then(() => {
    console.log('Database synchronized...');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
