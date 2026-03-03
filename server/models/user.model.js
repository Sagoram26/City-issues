const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 100]
      }
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50]
      }
    },
    role: {
      type: DataTypes.ENUM('citizen', 'admin'),
      defaultValue: 'citizen'
    },
    profileData: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  // Instance method to check password
  User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  // Instance method to get safe user data (without password)
  User.prototype.toSafeObject = function() {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      role: this.role,
      profileData: this.profileData,
      createdAt: this.createdAt
    };
  };

  return User;
};
