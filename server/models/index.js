const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

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

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./user.model')(sequelize, Sequelize);
db.Issue = require('./issue.model')(sequelize, Sequelize);
db.Vote = require('./vote.model')(sequelize, Sequelize);

// Define associations
// User has many Issues (one user can report many issues)
db.User.hasMany(db.Issue, {
  foreignKey: 'userId',
  as: 'issues'
});
db.Issue.belongsTo(db.User, {
  foreignKey: 'userId',
  as: 'reporter'
});

// User has many Votes
db.User.hasMany(db.Vote, {
  foreignKey: 'userId',
  as: 'votes'
});
db.Vote.belongsTo(db.User, {
  foreignKey: 'userId',
  as: 'user'
});

// Issue has many Votes
db.Issue.hasMany(db.Vote, {
  foreignKey: 'issueId',
  as: 'votes'
});
db.Vote.belongsTo(db.Issue, {
  foreignKey: 'issueId',
  as: 'issue'
});

module.exports = db;
