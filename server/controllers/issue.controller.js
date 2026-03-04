// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: controllers/issue.controller.js
// Gère toutes les opérations CRUD sur les signalements (issues).
// Inclut la création, lecture, vote, changement de statut et suppression.
// Émet des events WebSocket pour les mises à jour temps réel.
// ═══════════════════════════════════════════════════════════════════════════

const { Issue, User, Vote, sequelize } = require('../models');
const { Op } = require('sequelize'); // Opérateurs Sequelize (LIKE, BETWEEN, etc.)

// ═══════════════════════════════════════════════════════════════════════════
// CRÉER UN SIGNALEMENT (POST /api/issues)
// Crée un nouveau signalement avec titre, description, localisation et photo.
// Émet un event WebSocket "issue:new" pour notifier tous les clients.
// ═══════════════════════════════════════════════════════════════════════════
const createIssue = async (req, res) => {
  try {
    const { title, description, latitude, longitude, address, category } = req.body;
    
    // --- Validation des champs obligatoires ---
    if (!title || !description || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ 
        message: 'Title, description, and location (latitude/longitude) are required' 
      });
    }

    // --- Validation de la longueur du titre (5-200 caractères) ---
    if (title.length < 5 || title.length > 200) {
      return res.status(400).json({ 
        message: 'Title must be between 5 and 200 characters' 
      });
    }

    // --- Validation de la longueur de la description (10-5000 caractères) ---
    if (description.length < 10 || description.length > 5000) {
      return res.status(400).json({ 
        message: 'Description must be between 10 and 5000 characters' 
      });
    }

    // --- Validation des coordonnées GPS ---
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({ message: 'Invalid latitude' });
    }
    
    if (isNaN(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({ message: 'Invalid longitude' });
    }

    // --- Gestion de la photo uploadée (optionnel) ---
    let photoUrl = null;
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;  // URL relative
    }

    // --- Création du signalement en base ---
    const issue = await Issue.create({
      title: title.trim(),
      description: description.trim(),
      latitude: lat,
      longitude: lng,
      address: address || null,
      category: category || 'other',
      photoUrl,
      userId: req.user.id,  // L'auteur est l'utilisateur connecté
      status: 'open'        // Statut initial
    });

    // --- Récupère le signalement avec les infos du reporter ---
    const issueWithReporter = await Issue.findByPk(issue.id, {
      include: [{
        model: User,
        as: 'reporter',
        attributes: ['id', 'username']
      }]
    });

    // --- ÉMET UN EVENT WEBSOCKET "issue:new" (TEMPS RÉEL) ---
    // Tous les clients connectés recevront ce nouveau signalement
    const io = req.app.get('io');
    if (io) {
      io.emit('issue:new', issueWithReporter);
    }

    res.status(201).json(issueWithReporter);

  } catch (error) {
    console.error('Create issue error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    res.status(500).json({ message: 'Failed to create issue' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// LISTER LES SIGNALEMENTS (GET /api/issues)
// Retourne les signalements avec filtres optionnels (status, category, search).
// Supporte la pagination et le tri.
// ═══════════════════════════════════════════════════════════════════════════
const getIssues = async (req, res) => {
  try {
    // --- Extraction des paramètres de requête ---
    const { 
      status,           // Filtre par statut (open, in_progress, resolved, closed)
      category,         // Filtre par catégorie (road, lighting, waste, etc.)
      search,           // Recherche texte dans titre/description
      lat, lng, radius, // Filtre géographique (autour d'un point)
      page = 1,         // Numéro de page (pagination)
      limit = 20,       // Nombre de résultats par page
      sortBy = 'createdAt', // Champ de tri
      order = 'DESC'    // Ordre de tri (ASC ou DESC)
    } = req.query;

    const where = {};
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // --- Filtre par statut ---
    if (status && ['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      where.status = status;
    }

    // --- Filtre par catégorie ---
    if (category && ['road', 'lighting', 'waste', 'greenery', 'safety', 'noise', 'other'].includes(category)) {
      where.category = category;
    }

    // --- Recherche texte (LIKE insensible à la casse) ---
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // --- Filtre géographique : dans un rayon en km ---
    if (lat && lng && radius) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const radiusNum = parseFloat(radius);
      
      if (!isNaN(latNum) && !isNaN(lngNum) && !isNaN(radiusNum)) {
        // Calcul approximatif de la bounding box
        const latDelta = radiusNum / 111; // 1 degré ≈ 111km
        const lngDelta = radiusNum / (111 * Math.cos(latNum * Math.PI / 180));
        
        where.latitude = { [Op.between]: [latNum - latDelta, latNum + latDelta] };
        where.longitude = { [Op.between]: [lngNum - lngDelta, lngNum + lngDelta] };
      }
    }

    // --- Validation des options de tri ---
    const validSortFields = ['createdAt', 'voteCount', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // --- Requête avec pagination ---
    const { count, rows: issues } = await Issue.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'reporter',
        attributes: ['id', 'username']
      }],
      order: [[sortField, sortOrder]],
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
    console.error('Get issues error:', error);
    res.status(500).json({ message: 'Failed to fetch issues' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// RÉCUPÉRER UN SIGNALEMENT (GET /api/issues/:id)
// Retourne les détails d'un signalement avec ses votes et son auteur.
// ═══════════════════════════════════════════════════════════════════════════
const getIssueById = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await Issue.findByPk(id, {
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'username']
        },
        {
          model: Vote,
          as: 'votes',
          attributes: ['userId']  // On récupère juste les userId pour savoir qui a voté
        }
      ]
    });

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // --- Vérifie si l'utilisateur connecté a déjà voté ---
    let userHasVoted = false;
    if (req.user) {
      userHasVoted = issue.votes.some(vote => vote.userId === req.user.id);
    }

    res.json({
      ...issue.toJSON(),
      userHasVoted  // Indique au frontend si le user peut encore voter
    });

  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({ message: 'Failed to fetch issue' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// VOTER SUR UN SIGNALEMENT (POST /api/issues/:id/vote)
// Ajoute un vote de l'utilisateur connecté. Un user ne peut voter qu'une fois.
// Utilise une transaction pour garantir la cohérence.
// Émet un event WebSocket "issue:vote" pour mettre à jour le compteur en temps réel.
// ═══════════════════════════════════════════════════════════════════════════
const voteIssue = async (req, res) => {
  // Démarre une transaction pour éviter les incohérences
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    // --- Vérifie que le signalement existe ---
    const issue = await Issue.findByPk(id, { transaction });
    
    if (!issue) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Issue not found' });
    }

    // --- Vérifie si l'utilisateur a déjà voté ---
    const existingVote = await Vote.findOne({
      where: { userId: req.user.id, issueId: id },
      transaction
    });

    if (existingVote) {
      await transaction.rollback();
      return res.status(403).json({ message: 'You have already voted on this issue' });
    }

    // --- Crée le vote ---
    await Vote.create({
      userId: req.user.id,
      issueId: id
    }, { transaction });

    // --- Incrémente le compteur de votes ---
    await issue.increment('voteCount', { transaction });
    await issue.reload({ transaction });  // Recharge pour avoir la valeur à jour

    await transaction.commit();

    // --- ÉMET UN EVENT WEBSOCKET "issue:vote" (TEMPS RÉEL) ---
    const io = req.app.get('io');
    if (io) {
      io.emit('issue:vote', { issueId: id, voteCount: issue.voteCount });
    }

    res.json({ 
      message: 'Vote recorded', 
      voteCount: issue.voteCount 
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Vote error:', error);
    res.status(500).json({ message: 'Failed to vote' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// CHANGER LE STATUT (PATCH /api/issues/:id/status) - ADMIN UNIQUEMENT
// Permet à un admin de changer le statut d'un signalement.
// Émet un event WebSocket "issue:status" pour la mise à jour temps réel.
// ═══════════════════════════════════════════════════════════════════════════
const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // --- Validation du statut ---
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const issue = await Issue.findByPk(id);
    
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // --- Mise à jour du statut ---
    await issue.update({ status });

    // --- ÉMET UN EVENT WEBSOCKET "issue:status" (TEMPS RÉEL) ---
    const io = req.app.get('io');
    if (io) {
      io.emit('issue:status', { issueId: id, status });
    }

    res.json({ 
      message: 'Status updated', 
      issue 
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Failed to update status' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// SUPPRIMER UN SIGNALEMENT (DELETE /api/issues/:id)
// Supprime un signalement. Autorisé pour l'auteur ou un admin.
// Émet un event WebSocket "issue:delete" pour retirer le signalement en temps réel.
// ═══════════════════════════════════════════════════════════════════════════
const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await Issue.findByPk(id);
    
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // --- Vérification des permissions : admin OU auteur du signalement ---
    if (req.user.role !== 'admin' && issue.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this issue' });
    }

    await issue.destroy();

    // --- ÉMET UN EVENT WEBSOCKET "issue:delete" (TEMPS RÉEL) ---
    const io = req.app.get('io');
    if (io) {
      io.emit('issue:delete', { issueId: id });
    }

    res.json({ message: 'Issue deleted' });

  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({ message: 'Failed to delete issue' });
  }
};

// Export des fonctions du controller
module.exports = {
  createIssue,
  getIssues,
  getIssueById,
  voteIssue,
  updateIssueStatus,
  deleteIssue
};
