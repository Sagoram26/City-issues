// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: middleware/auth.middleware.js
// Middleware d'authentification JWT. Vérifie les tokens,
// gère les rôles (admin/citizen) et protège les routes.
// ═══════════════════════════════════════════════════════════════════════════

const jwt = require('jsonwebtoken');
const { User } = require('../models');

// ═══════════════════════════════════════════════════════════════════════════
// MIDDLEWARE: verifyToken
// Vérifie que le token JWT est présent et valide.
// Bloque la requête si le token est absent, expiré ou invalide.
// Ajoute req.user et req.userId pour les routes suivantes.
// ═══════════════════════════════════════════════════════════════════════════
const verifyToken = async (req, res, next) => {
  try {
    // Extrait le header Authorization (format: "Bearer <token>")
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Décode et vérifie le token avec la clé secrète
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Récupère l'utilisateur depuis la DB
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Ajoute l'utilisateur à la requête pour les routes suivantes
    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    // Token expiré
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    // Token invalide (mal formé, mauvaise signature...)
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Authentication error' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MIDDLEWARE: optionalAuth
// Comme verifyToken, mais ne bloque pas si le token est absent.
// Utile pour les routes publiques qui affichent plus d'infos aux users connectés.
// ═══════════════════════════════════════════════════════════════════════════
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Si un token est fourni, on essaie de l'utiliser
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      
      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    }
    
    // Continue même sans authentification
    next();
  } catch (error) {
    // Ignore les erreurs de token et continue
    next();
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MIDDLEWARE: isAdmin
// Vérifie que l'utilisateur connecté a le rôle "admin".
// Doit être utilisé APRÈS verifyToken.
// ═══════════════════════════════════════════════════════════════════════════
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};

// ═══════════════════════════════════════════════════════════════════════════
// MIDDLEWARE: isCitizen
// Vérifie que l'utilisateur est un "citizen" ou "admin".
// ═══════════════════════════════════════════════════════════════════════════
const isCitizen = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role !== 'citizen' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Citizen access required' });
  }
  
  next();
};

module.exports = {
  verifyToken,
  optionalAuth,
  isAdmin,
  isCitizen
};
