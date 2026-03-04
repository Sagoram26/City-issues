// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: models/user.model.js
// Modèle Sequelize pour la table "users". Gère les utilisateurs,
// leurs rôles (citizen/admin) et le hashage automatique des mots de passe.
// ═══════════════════════════════════════════════════════════════════════════

const bcrypt = require('bcryptjs'); // Librairie pour hasher les mots de passe

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    // --- Clé primaire : UUID généré automatiquement ---
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    // --- Email unique, format validé ---
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true  // Vérifie le format email
      }
    },
    // --- Mot de passe (6-100 caractères) ---
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 100]  // Longueur minimale et maximale
      }
    },
    // --- Nom d'utilisateur unique (3-50 caractères) ---
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50]
      }
    },
    // --- Rôle : citizen (défaut) ou admin ---
    role: {
      type: DataTypes.ENUM('citizen', 'admin'),
      defaultValue: 'citizen'
    },
    // --- Données de profil supplémentaires (JSON) ---
    profileData: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'users',
    timestamps: true,  // createdAt, updatedAt automatiques
    // --- HOOKS : exécutés automatiquement avant création/mise à jour ---
    hooks: {
      // Hash le mot de passe AVANT de créer l'utilisateur en base
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      // Hash le mot de passe si modifié lors d'une mise à jour
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  // --- Méthode d'instance : vérifie si le mot de passe est correct ---
  User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  // --- Méthode d'instance : retourne les données user sans le mot de passe ---
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
