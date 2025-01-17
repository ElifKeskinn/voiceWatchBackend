const db = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

exports.signup = async (req, res) => {
  const { name, surname, tcKimlik, age, password, bloodGroup, emergencyContacts, profilePic } = req.body;

  try {
    // Kullanıcıyı oluştur
    const user = await db.User.create({
      name,
      surname,
      tcKimlik,
      age,
      password,
      bloodGroup,
      profilePic
    });

    // Acil durum kontaklarını ekle
    if (emergencyContacts && emergencyContacts.length > 0) {
      const contacts = emergencyContacts.map(number => ({ contactNumber: number, userId: user.id }));
      await db.Contact.bulkCreate(contacts);
    }

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'TC Kimlik Numarası already exists' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.login = async (req, res) => {
  const { tcKimlik, password } = req.body;

  try {
    const user = await db.User.findOne({ where: { tcKimlik } });

    if (!user) return res.status(400).json({ message: 'Invalid TC Kimlik Numarası or password' });

    const isMatch = await user.validPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid TC Kimlik Numarası or password' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
