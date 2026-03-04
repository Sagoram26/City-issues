// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: routes/user.routes.js
// Définit les routes utilisateurs (profil public, gestion admin).
// ═══════════════════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// --- Routes publiques ---
router.get('/:id', userController.getUserById);        // Profil public d'un user
router.get('/:id/issues', userController.getUserIssues); // Signalements d'un user

// --- Routes admin uniquement ---
router.get('/', verifyToken, isAdmin, userController.getAllUsers);      // Lister tous les users
router.patch('/:id/role', verifyToken, isAdmin, userController.updateUserRole); // Changer le rôle

module.exports = router;
