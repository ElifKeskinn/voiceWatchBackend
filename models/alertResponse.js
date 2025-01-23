module.exports = (sequelize, DataTypes) => {
    const AlertResponse = sequelize.define('AlertResponse', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      alertId: { // İlgili acil durum bildirimi
        type: DataTypes.INTEGER,
        allowNull: false
      },
      userId: { // Yanıt veren kullanıcı (bu senaryoda, bildirim gönderen kullanıcı)
        type: DataTypes.INTEGER,
        allowNull: false
      },
      respondedAt: { // Yanıt zamanı
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      isDeleted: { // Soft delete için sütun
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    }, {
      tableName: 'AlertResponses',
      timestamps: false
      // Sequelize'ın paranoid özelliğini devre dışı bırakın
      // paranoid: true,
      // deletedAt: 'deletedAt'
    });
  
    AlertResponse.associate = (models) => {
      AlertResponse.belongsTo(models.Alert, { foreignKey: 'alertId', as: 'alert' });
      AlertResponse.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    };
  
    return AlertResponse;
  };
  