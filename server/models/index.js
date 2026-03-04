// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: models/index.js
// Point central de configuration Sequelize. Crée la connexion à la DB,
// importe tous les modèles et définit leurs associations (relations).
// ═══════════════════════════════════════════════════════════════════════════

const { Sequelize } = require('sequelize');
const config = require('../config/database');

// --- Sélection de la config selon l'environnement (development/test/production) ---
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// --- Création de l'instance Sequelize (connexion à PostgreSQL) ---
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    dialectOptions: dbConfig.dialectOptions || {}
  }
);

// --- Objet db : contient tous les modèles et la connexion Sequelize ---
const db = {};

db.Sequelize = Sequelize; // Classe Sequelize (pour les types, Op, etc.)
db.sequelize = sequelize; // Instance de connexion

// --- Import des modèles (User, Issue, Vote) ---
db.User = require('./user.model')(sequelize, Sequelize);
db.Issue = require('./issue.model')(sequelize, Sequelize);
db.Vote = require('./vote.model')(sequelize, Sequelize);

// ═══════════════════════════════════════════════════════════════════════════
// DÉFINITION DES ASSOCIATIONS (RELATIONS ENTRE TABLES)
// ═══════════════════════════════════════════════════════════════════════════

// --- User <-> Issue : Un utilisateur peut créer plusieurs signalements ---
db.User.hasMany(db.Issue, {
  foreignKey: 'userId',
  as: 'issues'  // user.getIssues()
});
db.Issue.belongsTo(db.User, {
  foreignKey: 'userId',
  as: 'reporter'  // issue.getReporter()
});

// --- User <-> Vote : Un utilisateur peut voter pour plusieurs signalements ---
db.User.hasMany(db.Vote, {
  foreignKey: 'userId',
  as: 'votes'  // user.getVotes()
});
db.Vote.belongsTo(db.User, {
  foreignKey: 'userId',
  as: 'user'  // vote.getUser()
});

// --- Issue <-> Vote : Un signalement peut recevoir plusieurs votes ---
db.Issue.hasMany(db.Vote, {
  foreignKey: 'issueId',
  as: 'votes'  // issue.getVotes()
});
db.Vote.belongsTo(db.Issue, {
  foreignKey: 'issueId',
  as: 'issue'  // vote.getIssue()
});

// Export de tous les modèles et de la connexion
module.exports = db;
