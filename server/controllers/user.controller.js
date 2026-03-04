// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: controllers/user.controller.js
// Gère les opérations sur les utilisateurs : profil public,
// liste des signalements d'un user, gestion des rôles (admin).
// ═══════════════════════════════════════════════════════════════════════════

const { User, Issue } = require('../models');

// ═══════════════════════════════════════════════════════════════════════════
// PROFIL PUBLIC D'UN UTILISATEUR (GET /api/users/:id)
// Retourne les infos publiques d'un user + nombre de signalements.
// ═══════════════════════════════════════════════════════════════════════════
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Récupère seulement les champs publics (pas l'email)
    const user = await User.findByPk(id, {
      attributes: ['id', 'username', 'role', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compte le nombre de signalements de cet utilisateur
    const issueCount = await Issue.count({ where: { userId: id } });

    res.json({
      ...user.toJSON(),
      issueCount
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// SIGNALEMENTS D'UN UTILISATEUR (GET /api/users/:id/issues)
// Retourne la liste paginée des signalements créés par un utilisateur.
// ═══════════════════════════════════════════════════════════════════════════
const getUserIssues = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Vérifie que l'utilisateur existe
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Liste paginée des signalements
    const { count, rows: issues } = await Issue.findAndCountAll({
      where: { userId: id },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      issues,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get user issues error:', error);
    res.status(500).json({ message: 'Failed to fetch user issues' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN : LISTER TOUS LES UTILISATEURS (GET /api/users)
// Réservé aux admins. Retourne la liste paginée de tous les users.
// ═══════════════════════════════════════════════════════════════════════════
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: users } = await User.findAndCountAll({
      attributes: ['id', 'username', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      users,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN : CHANGER LE RÔLE D'UN UTILISATEUR (PATCH /api/users/:id/role)
// Permet de promouvoir un user en admin ou de le rétrograder en citizen.
// ═══════════════════════════════════════════════════════════════════════════
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validation du rôle
    if (!role || !['citizen', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ role });

    res.json({
      message: 'User role updated',
      user: user.toSafeObject()
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
};

module.exports = {
  getUserById,
  getUserIssues,
  getAllUsers,
  updateUserRole
};
