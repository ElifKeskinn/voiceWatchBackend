const db = require('../models');
const { sendManualAlert } = require('../services/alertService');

/**
 * Manuel Acil Durum Bildirimi Gönderir
 * Route: POST /api/alert/manual
 */
exports.sendManualAlert = async (req, res) => {
  const user = req.user;

  try {
    await sendManualAlert(user);
    res.json({ message: 'Acil durum bildirimi gönderildi.' });
  } catch (err) {
    console.error('Manual alert error:', err);
    res.status(500).json({ message: err.message || 'Acil durum bildirimi gönderilirken hata oluştu.' });
  }
};

/**
 * Kullanıcının Acil Durum Bildirimine Yanıt Vermesini Sağlar
 * Route: POST /api/alert/respond
 */
exports.respondAlert = async (req, res) => {
  const { alertId } = req.body;

  if (!alertId) {
    return res.status(400).json({ message: 'alertId gerekli.' });
  }

  try {
    const alert = await db.Alert.findOne({ 
      where: { 
        id: alertId, 
        userId: req.user.id,
        isDeleted: false 
      } 
    });

    if (!alert) {
      return res.status(404).json({ message: 'Acil durum bildirimi bulunamadı.' });
    }

    if (alert.isResponded) {
      return res.status(400).json({ message: 'Bu acil durum bildirimi zaten yanıtlandı.' });
    }

    // Alert'ı yanıtlandı olarak işaretle
    await alert.update({ isResponded: true });

    // AlertResponse kaydını oluştur
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
 * Yapay Zeka Entegrasyonu İçin Endpoint
 * Route: POST /api/alert/ai-integration
 * 
 * Bu endpoint, yapay zeka modeli eğitildiğinde entegre edilecek şekilde hazırlanmıştır.
 * Gelecekte yapay zeka modelinden alınan sonuçlara göre acil durum bildirimi işlemleri yapılabilir.
 */
exports.aiIntegration = async (req, res) => {
  const { data } = req.body; // Yapay zeka modelinden gelen veri

  try {
    // Yapay zeka modelinin işleyebileceği veri işleme
    // Örneğin, belirli bir duruma göre manuel acil durum bildirimi tetiklemek

    // Bu kısım yapay zeka modeline bağlı olarak doldurulacaktır.

    res.json({ message: 'Yapay zeka entegrasyonu başarılı.' });
  } catch (err) {
    console.error('AI integration error:', err);
    res.status(500).json({ message: 'Yapay zeka entegrasyonu sırasında hata oluştu.' });
  }
};
