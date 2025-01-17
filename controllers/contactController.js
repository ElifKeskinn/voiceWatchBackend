const db = require('../models');

exports.getContacts = async (req, res) => {
  try {
    const contacts = await db.Contact.findAll({ where: { userId: req.user.id } });
    res.json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.addContact = async (req, res) => {
  const { contactNumber } = req.body;

  if (!contactNumber) return res.status(400).json({ message: 'Contact number is required' });

  try {
    const contact = await db.Contact.create({
      contactNumber,
      userId: req.user.id
    });

    res.status(201).json(contact);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateContact = async (req, res) => {
  const { id } = req.params;
  const { contactNumber } = req.body;

  try {
    const contact = await db.Contact.findOne({ where: { id, userId: req.user.id } });
    if (!contact) return res.status(404).json({ message: 'Contact not found' });

    contact.contactNumber = contactNumber || contact.contactNumber;
    await contact.save();

    res.json(contact);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteContact = async (req, res) => {
  const { id } = req.params;

  try {
    const contact = await db.Contact.findOne({ where: { id, userId: req.user.id } });
    if (!contact) return res.status(404).json({ message: 'Contact not found' });

    await contact.destroy();
    res.json({ message: 'Contact deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
