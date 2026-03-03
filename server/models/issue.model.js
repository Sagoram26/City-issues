module.exports = (sequelize, DataTypes) => {
  const Issue = sequelize.define('Issue', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [5, 200],
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [10, 5000],
        notEmpty: true
      }
    },
    photoUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
      validate: {
        min: -90,
        max: 90
      }
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
      validate: {
        min: -180,
        max: 180
      }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
      defaultValue: 'open'
    },
    category: {
      type: DataTypes.ENUM('road', 'lighting', 'waste', 'greenery', 'safety', 'noise', 'other'),
      defaultValue: 'other'
    },
    voteCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'issues',
    timestamps: true,
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['category']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['latitude', 'longitude']
      }
    ]
  });

  return Issue;
};
