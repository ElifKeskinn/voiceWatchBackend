
const { initializeApp, cert } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
require('dotenv').config();


// Firebase servis hesabı JSON stringini Base64 çözün ve parse edin
let serviceAccount;
try {
    const decodedJson = Buffer.from(process.env.FCM_SERVICE_ACCOUNT_FILE, 'base64').toString('utf-8');
    serviceAccount = JSON.parse(decodedJson);
} catch (err) {
    console.error('Firebase servis hesabı JSON parse edilirken hata oluştu:', err);
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
