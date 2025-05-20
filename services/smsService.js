// services/smsService.js
require('dotenv').config();
const { Vonage } = require('@vonage/server-sdk');

const vonage = new Vonage({
  apiKey:   process.env.VONAGE_API_KEY,
  apiSecret:process.env.VONAGE_API_SECRET
});
const from = process.env.VONAGE_FROM || 'VonageAPIs';

/**
 * Tek bir numaraya SMS gönderir.
 * @param {string} to    E.164 formatlı numara (örn: "+9053xxxxxxx")
 * @param {string} text  Mesaj içeriği
 */
async function sendSMS(to, text) {
  try {
    const resp = await vonage.sms.send({ to, from, text });
    return resp;
  } catch (err) {
    console.error('📵 SMS gönderme hatası:', err);
    throw err;
  }
}

module.exports = { sendSMS };
