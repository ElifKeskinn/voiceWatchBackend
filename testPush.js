// push bildirmi testi için
const { sendPushNotification } = require('./services/fcmService');

// Geçerli bir cihaz token'ı girin
const testDeviceToken = 'cihaz_tokenınız'; 
const testMessage = 'Bu bir test bildirimi.';

sendPushNotification(testDeviceToken, testMessage)
  .then(response => {
    console.log('Push bildirimi gönderildi:', response);
  })
  .catch(err => {
    console.error('Push bildirimi gönderilirken hata oluştu:', err);
  });
