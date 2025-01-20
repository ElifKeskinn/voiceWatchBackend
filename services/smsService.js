const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID; // Twilio Account SID
const authToken = process.env.TWILIO_AUTH_TOKEN;   // Twilio Auth Token
const fromPhone = process.env.TWILIO_PHONE_NUMBER; // Twilio Telefon Numarası

const client = twilio(accountSid, authToken);

/**
 * Belirtilen telefon numarasına SMS gönderir.
 * @param {string} to - Alıcı telefon numarası
 * @param {string} body - Gönderilecek mesaj
 * @returns {Promise}
 */
const sendSMS = (to, body) => {
  return client.messages.create({
    body,
    from: fromPhone,
    to
  });
};

module.exports = { sendSMS };
