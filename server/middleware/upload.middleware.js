// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: middleware/upload.middleware.js
// Configure Multer pour gérer l'upload de fichiers (photos).
// Limite la taille, valide le type MIME, et gère les erreurs.
// ═══════════════════════════════════════════════════════════════════════════

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Crée le dossier d'upload s'il n'existe pas ---
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// --- Configuration du stockage sur disque ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);  // Dossier de destination
  },
  filename: (req, file, cb) => {
    // Génère un nom unique : issue-<timestamp>-<random>.<ext>
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `issue-${uniqueSuffix}${ext}`);
  }
});

// --- Filtre de type : accepte seulement les images ---
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);   // Fichier accepté
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

// --- Configuration de Multer ---
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB par défaut
  }
});

// --- Middleware de gestion des erreurs d'upload ---
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Erreur Multer : fichier trop gros
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: err.message });
  } else if (err) {
    // Autre erreur (type de fichier invalide, etc.)
    return res.status(400).json({ message: err.message });
  }
  next();
};

module.exports = {
  upload,
  handleUploadError
};
