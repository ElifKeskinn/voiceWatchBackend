// services/alertService.js

const { sendPushNotification } = require('./fcmService');
const { sendSMS } = require('./smsService');
const db = require('../models');

/**
 * Kullanıcıya push bildirimi gönderir ve 15 saniye sonra yanıt kontrolü yapar.
 * @param {Object} user - Bildirimi gönderen kullanıcı nesnesi
 * @returns {Promise}
 */
const sendManualAlert = async (user) => {
  // Push bildirimi mesajı
  const pushMessage = 'İyi misiniz? Yanıt vermezseniz kontaklarınıza SMS gönderilecektir.';

  // Push bildirimi gönder
  if (user.deviceToken) {
    await sendPushNotification(user.deviceToken, pushMessage);
  } else {
    console.warn('Kullanıcının deviceToken bilgisi bulunmuyor.');
  }

  // Alert kaydı oluştur
  const alert = await db.Alert.create({
    userId: user.id
  });

  // 15 saniye bekle
  setTimeout(async () => {
    try {
      // Alert'ın yanıt verilip verilmediğini kontrol et
      const refreshedAlert = await db.Alert.findByPk(alert.id);
      if (!refreshedAlert.isResponded) {
        // Yanıt alınamadıysa, acil durum kontaklarına SMS gönder
        const contacts = await db.Contact.findAll({ where: { userId: user.id } });
        const contactNumbers = contacts.map(contact => contact.contactNumber);

        const smsMessage = `Kullanıcı ${user.name} ${user.surname} bir acil durum bildirimi gönderdi ve yanıt alamadık. Lütfen kontrol edin.`;

        for (let number of contactNumbers) {
          // Telefon numarasını E.164 formatına dönüştür
          let formattedNumber = number;
          if (number.startsWith('0')) {
            formattedNumber = `+90${number.slice(1)}`;
          } else if (!number.startsWith('+90')) {
            formattedNumber = `+90${number}`;
          }

          try {
            await sendSMS(formattedNumber, smsMessage);
          } catch (err) {
            console.error(`SMS gönderilirken hata oluştu: ${err.message}`);
          }
        }
      }
    } catch (err) {
      console.error(`Acil durum bildirimi sürecinde hata oluştu: ${err.message}`);
    }
  }, 15000); // 15 saniye = 15000 milisaniye
};

module.exports = { sendManualAlert };
