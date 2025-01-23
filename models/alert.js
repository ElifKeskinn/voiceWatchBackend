module.exports = (sequelize, DataTypes) => {
    const Alert = sequelize.define('Alert', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: DataTypes.INTEGER,
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, 
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      isResponded: { // Kullanıcının yanıt verip vermediği
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: { // Bildirim oluşturulma zamanı
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'Alerts',
      timestamps: false 
      // Sequelize'ın paranoid özelliğini devre dışı bırakın
      // paranoid: true,
      // deletedAt: 'deletedAt'
    });
  
    Alert.associate = (models) => {
      Alert.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Alert.hasMany(models.AlertResponse, { foreignKey: 'alertId', as: 'responses' });
    };
  
    return Alert;
  };
  