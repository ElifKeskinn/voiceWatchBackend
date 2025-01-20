const db = require('../models');
const bcrypt = require('bcryptjs');

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