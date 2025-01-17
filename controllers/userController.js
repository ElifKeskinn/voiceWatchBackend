const db = require('../models');
const bcrypt = require('bcryptjs');

exports.getMe = async (req, res) => {
  try {
    const user = req.user;
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
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

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = req.user;

    const isMatch = await user.validPassword(oldPassword);
    if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
