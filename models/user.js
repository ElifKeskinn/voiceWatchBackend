const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tcKimlik: {
      type: DataTypes.STRING,
      allowNull: false
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    phoneNumber: { 
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    bloodGroup: {
      type: DataTypes.STRING,
      allowNull: false
    },
    profilePic: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sensitivity: {
      type: DataTypes.INTEGER,
      defaultValue: 5
    },
    isDeleted: { 
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    deviceToken: { 
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'Users',
    hooks: {
      beforeCreate: async (user) => {
        const existingUser = await sequelize.models.User.findOne({
          where: { tcKimlik: user.tcKimlik, isDeleted: false }
        });
        if (existingUser) {
          throw new Error('Bu TC Kimlik Numarası ile aktif bir kullanıcı zaten mevcut.');
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      },
      beforeUpdate: async (user) => {
        if (user.changed('tcKimlik')) {
          const existingUser = await sequelize.models.User.findOne({
            where: { tcKimlik: user.tcKimlik, isDeleted: false, id: { [sequelize.Op.ne]: user.id } }
          });
          if (existingUser) {
            throw new Error('Bu TC Kimlik Numarası ile aktif bir kullanıcı zaten mevcut.');
          }
        }
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  User.prototype.validPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  return User;
};
