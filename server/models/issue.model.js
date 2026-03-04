// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: models/issue.model.js
// Modèle Sequelize pour la table "issues". Représente un signalement
// de problème dans la ville (nid de poule, lampadaire en panne, etc.)
// ═══════════════════════════════════════════════════════════════════════════

module.exports = (sequelize, DataTypes) => {
  const Issue = sequelize.define('Issue', {
    // --- Clé primaire UUID ---
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    // --- Titre du signalement (5-200 caractères) ---
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [5, 200],
        notEmpty: true
      }
    },
    // --- Description détaillée (10-5000 caractères) ---
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [10, 5000],
        notEmpty: true
      }
    },
    // --- URL de la photo (optionnel) ---
    photoUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // --- Coordonnées GPS : latitude (-90 à +90) ---
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
      validate: {
        min: -90,
        max: 90
      }
    },
    // --- Coordonnées GPS : longitude (-180 à +180) ---
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
      validate: {
        min: -180,
        max: 180
      }
    },
    // --- Adresse textuelle (optionnel) ---
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // --- Statut du signalement ---
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
      defaultValue: 'open' // open = nouveau signalement
    },
    // --- Catégorie du problème ---
    category: {
      type: DataTypes.ENUM('road', 'lighting', 'waste', 'greenery', 'safety', 'noise', 'other'),
      defaultValue: 'other'
    },
    // --- Compteur de votes (pour prioriser les problèmes) ---
    voteCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    // --- Clé étrangère vers l'utilisateur qui a créé le signalement ---
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
    timestamps: true,  // createdAt, updatedAt
    // --- Index pour accélérer les requêtes fréquentes ---
    indexes: [
      { fields: ['status'] },      // Filtre par statut
      { fields: ['category'] },    // Filtre par catégorie
      { fields: ['userId'] },      // Signalements d'un utilisateur
      { fields: ['latitude', 'longitude'] } // Recherche géographique
    ]
  });

  return Issue;
};
