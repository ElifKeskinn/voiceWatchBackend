const db = require('../models');

exports.getContacts = async (req, res) => {
  try {
    const contacts = await db.Contact.findAll({ where: { userId: req.user.id } });
    res.json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu Hatası' });
  }
};

exports.addContact = async (req, res) => {
  const { contactNumber, contactInfo } = req.body;

  if (!contactNumber || !contactInfo) {
    return res.status(400).json({ message: 'Kontakt numarası ve bilgisi gerekli.' });
  }

  try {
    // Aynı kontak numarasının varlığını kontrol et
    const existingContact = await db.Contact.findOne({
      where: {
        userId: req.user.id,
        contactNumber: contactNumber,
        isDeleted: false
      }
    });

    if (existingContact) {
      return res.status(400).json({ message: 'Bu kontak numarası zaten mevcut.' });
    }

    const contact = await db.Contact.create({
      contactNumber,
      contactInfo,
      userId: req.user.id
    });

    res.status(201).json(contact);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu Hatası' });
  }
};

exports.updateContact = async (req, res) => {
  const { id } = req.params;
  const { contactNumber, contactInfo } = req.body;

  try {
    const contact = await db.Contact.findOne({ where: { id, userId: req.user.id , isDeleted: false } });
    if (!contact) return res.status(404).json({ message: 'Kontakt bulunamadı.' });

     // Eğer contactNumber güncelleniyorsa, aynı numaranın başka bir kontakta olup olmadığını kontrol et
     if (contactNumber && contactNumber !== contact.contactNumber) {
      const duplicateContact = await db.Contact.findOne({
        where: {
          userId: req.user.id,
          contactNumber: contactNumber,
          isDeleted: false
        }
      });

      if (duplicateContact) {
        return res.status(400).json({ message: 'Bu kontak numarası zaten mevcut.' });
      }
    }
    contact.contactNumber = contactNumber || contact.contactNumber;
    contact.contactInfo = contactInfo || contact.contactInfo;
    await contact.save();

    res.json(contact);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu Hatası' });
  }
};

exports.deleteContact = async (req, res) => {
  const { id } = req.params;

  try {
    const contact = await db.Contact.findOne({ where: { id, userId: req.user.id } });
    if (!contact) return res.status(404).json({ message: 'Kontakt bulunamadı.' });

    await contact.destroy();
    res.json({ message: 'Kontakt başarıyla silindi.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Sunucu Hatası' });
  }
};
