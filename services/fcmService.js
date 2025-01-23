
const { initializeApp, cert } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const fs = require('fs');
require('dotenv').config();

// Firebase servis hesabı anahtarını JSON dosyasından yükleyin
const serviceAccountPath = process.env.FCM_SERVICE_ACCOUNT_FILE;

if (!serviceAccountPath) {
  throw new Error('FCM_SERVICE_ACCOUNT_FILE env değişkeni tanımlı değil.');
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
} catch (err) {
  console.error('Firebase servis hesabı anahtarını yüklerken hata oluştu:', err);
  throw err;
}

// Firebase Admin SDK'yı başlatın
initializeApp({
  credential: cert(serviceAccount)
});

const messaging = getMessaging();

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

  const messagePayload = {
    token: deviceToken,
    notification: payload.notification
  };

  return messaging.send(messagePayload);
};

module.exports = { sendPushNotification };
