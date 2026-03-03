module.exports = (sequelize, DataTypes) => {
  const Vote = sequelize.define('Vote', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    issueId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'issues',
        key: 'id'
      }
    }
  }, {
    tableName: 'votes',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'issueId']
      }
    ]
  });

  return Vote;
};
