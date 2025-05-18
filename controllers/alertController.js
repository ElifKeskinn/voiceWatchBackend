const db = require('../models');
const { sendManualAlert } = require('../services/alertService');
const { predictFromSpectrogram  } = require('../services/aiService');
const { sendSMS } = require('../services/smsService');
const CATEGORIES = ['glass_breaking', 'fall', 'silence', 'scream'];


/**
 * Manuel acil durum bildirimi: push → 15s sonra yanıt yoksa SMS
 */
exports.sendManualAlert = async (req, res) => {
  try {
    await alertLogic(req.user);
    res.json({ message: 'Acil durum bildirimi gönderildi.' });
  } catch (err) {
    console.error('Manual alert error:', err);
    res.status(500).json({ message: err.message || 'Acil durum bildirimi gönderilirken hata oluştu.' });
  }
};

/**
 * 2) Kullanıcının acil durum bildirimi yanıtı
 *    POST /api/alert/respond
 */
exports.respondAlert = async (req, res) => {
  const { alertId } = req.body;
  if (!alertId) {
    return res.status(400).json({ message: 'alertId gerekli.' });
  }

  try {
    const alert = await db.Alert.findOne({
      where: { id: alertId, userId: req.user.id, isDeleted: false }
    });
    if (!alert) {
      return res.status(404).json({ message: 'Acil durum bildirimi bulunamadı.' });
    }
    if (alert.isResponded) {
      return res.status(400).json({ message: 'Bu acil durum bildirimi zaten yanıtlandı.' });
    }

    await alert.update({ isResponded: true });
    await db.AlertResponse.create({
      alertId: alert.id,
      userId: req.user.id
    });

    res.json({ message: 'Acil durum bildiriminize yanıt verildi.' });
  } catch (err) {
    console.error('Respond alert error:', err);
    res.status(500).json({ message: 'Acil durum bildirimi yanıtlanırken hata oluştu.' });
  }
};

/**
 * 3) Toplu SMS gönderimi
 *    POST /api/alert/send-sms
 */
exports.sendCustomSMS = async (req, res) => {
  const { numbers, message } = req.body;
  if (!Array.isArray(numbers) || numbers.length === 0 || !message) {
    return res.status(400).json({ message: 'numbers (array) ve message (string) gerekli.' });
  }

  const formatNum = n => {
    let num = n.toString().trim();
    if (num.startsWith('0'))       num = `+90${num.slice(1)}`;
    else if (!num.startsWith('+90')) num = `+90${num}`;
    return num;
  };

  const results = [];
  for (let raw of numbers) {
    const to = formatNum(raw);
    try {
      const resp = await sendSMS(to, message);
      results.push({ to, status: 'sent', resp });
    } catch (err) {
      results.push({ to, status: 'error', error: err.message });
    }
  }

  res.json({
    message: 'Toplu SMS gönderimi tamamlandı.',
    results
  });
};



/**
 * Yapay Zeka Entegrasyonu İçin Endpoint
 * Route: POST /api/alert/ai-integration

 */

exports.aiIntegration = async (req, res) => {
  const { data } = req.body;  // 2B Mel-spektral veri
  if (!data) {
    return res.status(400).json({ message: 'Mel-spektral veri gerekli.' });
  }

  try {
    const prediction = await predictFromSpectrogram(data);
    const maxVal = Math.max(...prediction);
    const maxIdx = prediction.indexOf(maxVal);

    // 🔒 0.5 eşiği kontrolü
    const result = maxVal < 0.7 ? 'safe' : CATEGORIES[maxIdx];

    res.json({
      message: 'Yapay zeka entegrasyonu başarılı.',
      prediction,
      result
    });
  } catch (err) {
    console.error('AI integration error:', err);
    res.status(500).json({ message: err.message || 'Yapay zeka entegrasyonu sırasında hata oluştu.' });
  }
};
