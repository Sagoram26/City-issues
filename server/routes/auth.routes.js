// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: routes/auth.routes.js
// Définit les routes d'authentification (inscription, connexion, profil).
// ═══════════════════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// --- Routes publiques (pas besoin de token) ---
router.post('/register', authController.register); // Créer un compte
router.post('/login', authController.login);       // Se connecter

// --- Routes protégées (token requis) ---
router.get('/profile', verifyToken, authController.getProfile);    // Voir son profil
router.patch('/profile', verifyToken, authController.updateProfile); // Modifier son profil

module.exports = router;
