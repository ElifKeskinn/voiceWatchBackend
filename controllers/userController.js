const db = require('../models');
const bcrypt = require('bcryptjs');
const { sendSMS } = require('../services/smsService');
const { v4: uuidv4 } = require('uuid'); // Kod üretimi için
const { Op } = require('sequelize');

exports.getMe = async (req, res) => {
  try {
    const user = req.user.toJSON();
    delete user.password; // Şifreyi sil
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu Hatası' });
  }
};

exports.updateProfile = async (req, res) => {
  const { name, surname, age, bloodGroup, profilePic } = req.body;

  try {
    const user = req.user;
    await user.update({
      name: name || user.name,
      surname: surname || user.surname,
      age: age || user.age,
      bloodGroup: bloodGroup || user.bloodGroup,
      profilePic: profilePic || user.profilePic
    });

    res.json({ message: 'Profil başarıyla güncellendi.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu Hatası' });
  }
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = req.user;

    // Eski şifrenin doğruluğunu kontrol et
    const isMatch = await user.validPassword(oldPassword);
    if (!isMatch) return res.status(400).json({ message: 'Eski şifre yanlış.' });

    // Yeni şifreyi ata ve kaydet
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Şifre başarıyla değiştirildi.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu Hatası' });
  }
};

// Yeni Hesap Silme Fonksiyonu
exports.deleteAccount = async (req, res) => {
  const { password } = req.body;

  // Şifre alanının mevcut olup olmadığını kontrol et
  if (!password) {
    return res.status(400).json({ message: 'Şifre gerekli.' });
  }

  try {
    const user = req.user;

    // Şifrenin doğruluğunu kontrol et
    const isMatch = await user.validPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Şifre yanlış.' });
    }

    // Soft delete işlemi: isDeleted'ı true yap
    await user.update({ isDeleted: true });

    res.json({ message: 'Hesabınız başarıyla silindi.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu Hatası.' });
  }
};
/**
 * Şifre sıfırlama isteği gönderir ve SMS ile kod gönderir.
 */
exports.forgotPassword = async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ message: 'Telefon numarası gerekli.' });
  }

  try {
    const user = await db.User.findOne({ where: { phoneNumber, isDeleted: false } });

    if (!user) {
      return res.status(400).json({ message: 'Bu telefon numarasına sahip kullanıcı bulunamadı.' });
    }

    // Daha önceki geçerli kodları temizle
    await db.PasswordReset.destroy({
      where: {
        userId: user.id,
        expiresAt: { [Op.gt]: new Date() }
      }
    });

    // Benzersiz bir reset kodu oluştur (6 haneli rastgele sayı)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 haneli kod

    // Kodun geçerlilik süresini ayarla (örneğin, 10 dakika)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // PasswordReset kaydını oluştur
    await db.PasswordReset.create({
      userId: user.id,
      resetCode,
      expiresAt
    });

    // Telefon numarasını E.164 formatına dönüştür
    // Türkiye için +90 ekleyin ve baştaki 0'ı kaldırın
    let formattedPhoneNumber = phoneNumber;
    if (phoneNumber.startsWith('0')) {
      formattedPhoneNumber = `+90${phoneNumber.slice(1)}`;
    } else if (!phoneNumber.startsWith('+90')) {
      // Eğer telefon numarası +90 ile başlamıyorsa, ekleyin
      formattedPhoneNumber = `+90${phoneNumber}`;
    }

    // SMS gönder
    const message = `VoiceWatch Şifre Sıfırlama Kodu: ${resetCode}`;
    await sendSMS(formattedPhoneNumber, message);

    res.json({ message: 'Şifre sıfırlama kodu telefonunuza gönderildi.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu Hatası' });
  }
};

/**
 * Reset kodu doğrular ve yeni şifreyi ayarlar.
 */
exports.resetPassword = async (req, res) => {
  const { resetCode, newPassword } = req.body;

  if (!resetCode || !newPassword) {
    return res.status(400).json({ message: 'Reset kodu ve yeni şifre gerekli.' });
  }

  try {
    const passwordReset = await db.PasswordReset.findOne({
      where: {
        resetCode,
        expiresAt: { [Op.gt]: new Date() }
      },
      include: [{ model: db.User, as: 'user' }]
    });

    if (!passwordReset) {
      return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş reset kodu.' });
    }

    const user = passwordReset.user;

    // Yeni şifreyi hash'le
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Kullanıcının şifresini güncelle
    await user.update({ password: hashedPassword });

    // PasswordReset kaydını sil
    await passwordReset.destroy();

    res.json({ message: 'Şifreniz başarıyla güncellendi.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu Hatası' });
  }
};