// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: config/database.js
// Configuration de la connexion à PostgreSQL pour chaque environnement.
// Les valeurs sont lues depuis les variables d'environnement (.env)
// ═══════════════════════════════════════════════════════════════════════════

require('dotenv').config();

module.exports = {
  // --- Environnement de développement local ---
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'city_issues',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',  // Type de base de données
    logging: console.log  // Affiche les requêtes SQL dans la console
  },
  // --- Environnement de test (pour les tests automatisés) ---
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'city_issues_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false  // Pas de logs en mode test
  },
  // --- Environnement de production ---
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,  // Pas de logs SQL en production
    dialectOptions: {
      ssl: {         // SSL obligatoire pour les DB cloud (Heroku, Railway...)
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};
