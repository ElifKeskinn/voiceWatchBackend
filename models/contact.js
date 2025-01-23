module.exports = (sequelize, DataTypes) => {
  const Contact = sequelize.define('Contact', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    contactNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contactInfo: { 
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    isDeleted: { // Soft delete için sütun
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'Contacts',
    // Sequelize'ın paranoid özelliğini devre dışı bırakın
    // paranoid: true,
    // deletedAt: 'deletedAt'
  });

  return Contact;
};
