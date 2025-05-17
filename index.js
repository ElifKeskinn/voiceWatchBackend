const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const db = require('./models'); // Sequelize modelleri
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const contactRoutes = require('./routes/contactRoutes');
const alertRoutes = require('./routes/alertRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { loadModel } = require('./services/aiService');
const { setupWebSocket } = require('./websocket');

dotenv.config();
const cors = require('cors'); // CORS paketi kuruldu
const app = express();

// Middleware
app.use(cors());//bu kısım sonradan frontend yayına alındığında değiştirilecek
app.use(express.json({ limit: '50mb' })); 

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
        url: process.env.NODE_ENV === 'production' 
          ? 'https://voicewatchbackend-production.up.railway.app' 
          : `http://localhost:${process.env.PORT || 5000}`,
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
// 1) HTTP sunucu oluştur
const server = http.createServer(app);

// 2) WebSocket setup
setupWebSocket(server);

// 3) Ardından DB sync + TF model load
db.sequelize.authenticate()
  .then(() => db.sequelize.sync())
  .then(async () => {
    console.log('✅ Database hazır.');
    await loadModel();  // SavedModel’i burada önceden yükleyelim
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`🚀 Server ${PORT} portunda`));
  })
  .catch(err => {
    console.error('❌ Başlangıç hatası:', err);
  });