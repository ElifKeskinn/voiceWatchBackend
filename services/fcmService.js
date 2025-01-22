const admin = require('firebase-admin');
require('dotenv').config();

// Firebase servis hesabı anahtarını JSON dosyasından yükleyin
const fs = require('fs');
const serviceAccount = JSON.parse(fs.readFileSync(process.env.FCM_SERVICE_ACCOUNT_FILE, 'utf-8'));

// Firebase Admin SDK'yı başlatın
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

/**
 * Belirtilen cihaz token'ına push bildirimi gönderir.
 * @param {string} deviceToken - Cihazın FCM token'ı
 * @param {string} message - Gönderilecek mesaj
 * @returns {Promise}
 */
const sendPushNotification = (deviceToken, message) => {
  const payload = {
    notification: {
      title: 'VoiceWatch',
      body: message
    }
  };

  return admin.messaging().sendToDevice(deviceToken, payload);
};

module.exports = { sendPushNotification };
