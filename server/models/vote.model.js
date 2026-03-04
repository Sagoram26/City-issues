// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: models/vote.model.js
// Modèle Sequelize pour la table "votes". Enregistre les votes
// des utilisateurs sur les signalements. Un user ne peut voter
// qu'une seule fois par signalement (contrainte unique userId+issueId).
// ═══════════════════════════════════════════════════════════════════════════

module.exports = (sequelize, DataTypes) => {
  const Vote = sequelize.define('Vote', {
    // --- Clé primaire UUID ---
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    // --- Référence à l'utilisateur qui vote ---
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    // --- Référence au signalement voté ---
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
    timestamps: true,  // createdAt = date du vote
    indexes: [
      {
        unique: true,  // Un user ne peut voter qu'une fois par signalement
        fields: ['userId', 'issueId']
      }
    ]
  });

  return Vote;
};
