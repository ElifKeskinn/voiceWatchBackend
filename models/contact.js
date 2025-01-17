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
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    }, {
      tableName: 'Contacts'
    });
  
    return Contact;
  };
  