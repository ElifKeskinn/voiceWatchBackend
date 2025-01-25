const db = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { ValidationError, UniqueConstraintError } = require('sequelize');

exports.signup = async (req, res) => {
  const { name, surname, tcKimlik, age, phoneNumber, password, bloodGroup, emergencyContacts, profilePic } = req.body;

  // En az iki acil durum kontakının sağlanıp sağlanmadığını kontrol et
  if (!emergencyContacts || !Array.isArray(emergencyContacts) || emergencyContacts.length < 2) {
    return res.status(400).json({ message: 'En az iki acil durum kontak bilgisi gerekli.' });
  }

  // Her bir kontakın gerekli alanlara sahip olup olmadığını kontrol et
  for (let contact of emergencyContacts) {
    if (!contact.contactNumber || !contact.contactInfo) {
      return res.status(400).json({ message: 'Acil durum kontaklarının hem numarası hem de bilgisi olmalı.' });
    }
  }
  // TC Kimlik Numarasının doğru formatta olup olmadığını kontrol et
  const tcRegex = /^\d{11}$/;
  if (!tcRegex.test(tcKimlik)) {
    return res.status(400).json({ message: 'TC Kimlik Numarası tam olarak 11 haneli olmalıdır.' });
  }

  try {
    // Mevcut kullanıcıyı kontrol et
    const existingUser = await db.User.findOne({
      where: {
        tcKimlik,
        isDeleted: false, // Yalnızca aktif kullanıcıları kontrol et
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Bu TC Kimlik Numarası ile aktif bir kullanıcı zaten mevcut.' });
    }

    // Kullanıcıyı oluştur
    const user = await db.User.create({
      name,
      surname,
      tcKimlik,
      age,
      phoneNumber,
      password,
      bloodGroup,
      profilePic,
    });

    // Acil durum kontaklarını ekle
    const contacts = emergencyContacts.map((contact) => ({
      contactNumber: contact.contactNumber,
      contactInfo: contact.contactInfo,
      userId: user.id,
    }));
    await db.Contact.bulkCreate(contacts);

    res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu.' });
  } catch (err) {
    console.error(err);
    if (err instanceof ValidationError || err instanceof UniqueConstraintError) {
      const messages = err.errors.map((error) => error.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Sunucu Hatası' });
  }
};

exports.login = async (req, res) => {
  const { tcKimlik, password, deviceToken } = req.body;

  try {
    const user = await db.User.findOne({ where: { tcKimlik, isDeleted: false } });

    if (!user) return res.status(400).json({ message: 'Geçersiz TC Kimlik Numarası veya şifre.' });

    const isMatch = await user.validPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Geçersiz TC Kimlik Numarası veya şifre.' });

    // Update deviceToken if provided
    if (deviceToken) {
      user.deviceToken = deviceToken;
      await user.save();
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu Hatası' });
  }
};
