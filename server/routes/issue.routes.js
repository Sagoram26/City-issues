// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: routes/issue.routes.js
// Définit les routes pour les signalements (CRUD, vote, changement de statut).
// ═══════════════════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issue.controller');
const { verifyToken, optionalAuth, isAdmin } = require('../middleware/auth.middleware');
const { upload, handleUploadError } = require('../middleware/upload.middleware');

// --- Routes publiques (optionalAuth = infos supplémentaires si connecté) ---
router.get('/', optionalAuth, issueController.getIssues);           // Liste des signalements
router.get('/:id', optionalAuth, issueController.getIssueById);     // Détail d'un signalement

// --- Routes protégées (token requis) ---
router.post('/', 
  verifyToken,                  // User connecté
  upload.single('photo'),       // Upload d'une photo (champ "photo")
  handleUploadError,            // Gestion des erreurs d'upload
  issueController.createIssue   // Créer un signalement
);

router.post('/:id/vote', verifyToken, issueController.voteIssue);   // Voter

// --- Routes admin uniquement ---
router.patch('/:id/status', verifyToken, isAdmin, issueController.updateIssueStatus); // Changer statut

// --- Suppression (admin OU auteur) ---
router.delete('/:id', verifyToken, issueController.deleteIssue);

module.exports = router;
