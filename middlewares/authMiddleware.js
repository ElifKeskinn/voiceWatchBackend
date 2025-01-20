const jwt = require('jsonwebtoken');
const db = require('../models');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.User.findOne({
      where: {
        id: decoded.id,
        isDeleted: false 
      },
      include: [{ model: db.Contact, as: 'emergencyContacts' }]
    });

    if (!user) return res.status(401).json({ message: 'Kullanıcı bulunamadı.' });

    req.user = user; // Kullanıcı bilgisi req nesnesine ekleniyor
    next();
  } catch (err) {
    console.error(err);
    res.status(403).json({ message: 'Geçersiz token.' });
  }
};

module.exports = authMiddleware;
