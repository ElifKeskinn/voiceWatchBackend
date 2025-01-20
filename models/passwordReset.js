module.exports = (sequelize, DataTypes) => {
    const PasswordReset = sequelize.define('PasswordReset', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      resetCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    }, {
      tableName: 'PasswordResets'
    });
  
    PasswordReset.associate = (models) => {
      PasswordReset.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    };
  
    return PasswordReset;
  };
  