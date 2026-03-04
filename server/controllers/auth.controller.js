// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: controllers/auth.controller.js
// Gère l'authentification : inscription, connexion, profil utilisateur.
// Utilise JWT (JSON Web Token) pour sécuriser les sessions.
// ═══════════════════════════════════════════════════════════════════════════

const jwt = require('jsonwebtoken');
const { User } = require('../models');

// --- Génère un token JWT valide 7 jours par défaut ---
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role }, // Payload
    process.env.JWT_SECRET,                               // Clé secrète
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }    // Durée de validité
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// INSCRIPTION (POST /api/auth/register)
// Crée un nouveau compte utilisateur et retourne un token JWT.
// ═══════════════════════════════════════════════════════════════════════════
const register = async (req, res) => {
  try {
    const { email, password, username, role, profileData } = req.body;

    // --- Validation des champs obligatoires ---
    if (!email || !password || !username) {
      return res.status(400).json({ 
        message: 'Email, password, and username are required' 
      });
    }

    // --- Vérification du format email avec regex ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // --- Mot de passe : minimum 6 caractères ---
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // --- Username : entre 3 et 50 caractères ---
    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({ 
        message: 'Username must be between 3 and 50 characters' 
      });
    }

    // --- Vérifie si l'email existe déjà ---
    const existingUser = await User.findOne({ 
      where: { email: email.toLowerCase() } 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // --- Vérifie si le username est déjà pris ---
    const existingUsername = await User.findOne({ 
      where: { username } 
    });
    
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // --- Sécurité : empêche de s'inscrire directement en admin ---
    // Les admins doivent être créés via le script create-admin.js
    const userRole = (role === 'admin') ? 'citizen' : (role || 'citizen');

    // --- Création de l'utilisateur en base ---
    const user = await User.create({
      email: email.toLowerCase(),
      password,  // Hashé automatiquement par le hook beforeCreate
      username,
      role: userRole,
      profileData: profileData || {}
    });

    // --- Génère le token et renvoie la réponse ---
    const token = generateToken(user);

    res.status(201).json({
      token,
      user: user.toSafeObject()  // Sans le mot de passe
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Erreur de validation Sequelize
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    // Contrainte d'unicité violée (email ou username)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Email or username already exists' });
    }

    res.status(500).json({ message: 'Registration failed' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// CONNEXION (POST /api/auth/login)
// Vérifie les identifiants et retourne un token JWT si valides.
// ═══════════════════════════════════════════════════════════════════════════
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- Validation des champs ---
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    // --- Recherche l'utilisateur par email ---
    const user = await User.findOne({ 
      where: { email: email.toLowerCase() } 
    });

    // Message générique pour ne pas révéler si l'email existe
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // --- Vérifie le mot de passe avec bcrypt ---
    const isValidPassword = await user.validatePassword(password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // --- Génère le token et renvoie la réponse ---
    const token = generateToken(user);

    res.status(200).json({
      token,
      user: user.toSafeObject()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// PROFIL UTILISATEUR (GET /api/auth/profile)
// Retourne les infos du user connecté (nécessite un token valide).
// ═══════════════════════════════════════════════════════════════════════════
const getProfile = async (req, res) => {
  try {
    // req.user est défini par le middleware verifyToken
    res.json(req.user.toSafeObject());
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// MISE À JOUR DU PROFIL (PATCH /api/auth/profile)
// Permet de modifier son username ou ses données de profil.
// ═══════════════════════════════════════════════════════════════════════════
const updateProfile = async (req, res) => {
  try {
    const { username, profileData } = req.body;
    const updates = {};

    // --- Mise à jour du username (vérifie l'unicité) ---
    if (username) {
      const existingUsername = await User.findOne({ 
        where: { username } 
      });
      
      // Vérifie que ce n'est pas le même user
      if (existingUsername && existingUsername.id !== req.user.id) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      
      updates.username = username;
    }

    // --- Fusion des données de profil existantes + nouvelles ---
    if (profileData) {
      updates.profileData = { ...req.user.profileData, ...profileData };
    }

    await req.user.update(updates);
    
    res.json(req.user.toSafeObject());

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// Export des fonctions du controller
module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
