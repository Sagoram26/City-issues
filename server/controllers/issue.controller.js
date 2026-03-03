const { Issue, User, Vote, sequelize } = require('../models');
const { Op } = require('sequelize');

// Create a new issue
const createIssue = async (req, res) => {
  try {
    const { title, description, latitude, longitude, address, category } = req.body;
    
    // Validate required fields
    if (!title || !description || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ 
        message: 'Title, description, and location (latitude/longitude) are required' 
      });
    }

    // Validate title length
    if (title.length < 5 || title.length > 200) {
      return res.status(400).json({ 
        message: 'Title must be between 5 and 200 characters' 
      });
    }

    // Validate description length
    if (description.length < 10 || description.length > 5000) {
      return res.status(400).json({ 
        message: 'Description must be between 10 and 5000 characters' 
      });
    }

    // Validate coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({ message: 'Invalid latitude' });
    }
    
    if (isNaN(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({ message: 'Invalid longitude' });
    }

    // Handle uploaded photo
    let photoUrl = null;
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }

    // Create the issue
    const issue = await Issue.create({
      title: title.trim(),
      description: description.trim(),
      latitude: lat,
      longitude: lng,
      address: address || null,
      category: category || 'other',
      photoUrl,
      userId: req.user.id,
      status: 'open'
    });

    // Fetch the issue with reporter info
    const issueWithReporter = await Issue.findByPk(issue.id, {
      include: [{
        model: User,
        as: 'reporter',
        attributes: ['id', 'username']
      }]
    });

    // Emit WebSocket event for real-time updates
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

// Get all issues with filtering
const getIssues = async (req, res) => {
  try {
    const { 
      status, 
      category, 
      search, 
      lat, 
      lng, 
      radius,
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      order = 'DESC'
    } = req.query;

    const where = {};
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Filter by status
    if (status && ['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      where.status = status;
    }

    // Filter by category
    if (category && ['road', 'lighting', 'waste', 'greenery', 'safety', 'noise', 'other'].includes(category)) {
      where.category = category;
    }

    // Search in title and description
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Filter by location (within radius in km)
    if (lat && lng && radius) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const radiusNum = parseFloat(radius);
      
      if (!isNaN(latNum) && !isNaN(lngNum) && !isNaN(radiusNum)) {
        // Approximate bounding box
        const latDelta = radiusNum / 111; // 1 degree ≈ 111km
        const lngDelta = radiusNum / (111 * Math.cos(latNum * Math.PI / 180));
        
        where.latitude = { [Op.between]: [latNum - latDelta, latNum + latDelta] };
        where.longitude = { [Op.between]: [lngNum - lngDelta, lngNum + lngDelta] };
      }
    }

    // Validate sort options
    const validSortFields = ['createdAt', 'voteCount', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

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

// Get single issue by ID
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
          attributes: ['userId']
        }
      ]
    });

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if current user has voted
    let userHasVoted = false;
    if (req.user) {
      userHasVoted = issue.votes.some(vote => vote.userId === req.user.id);
    }

    res.json({
      ...issue.toJSON(),
      userHasVoted
    });

  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({ message: 'Failed to fetch issue' });
  }
};

// Vote on an issue
const voteIssue = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    // Check if issue exists
    const issue = await Issue.findByPk(id, { transaction });
    
    if (!issue) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if user already voted
    const existingVote = await Vote.findOne({
      where: { userId: req.user.id, issueId: id },
      transaction
    });

    if (existingVote) {
      await transaction.rollback();
      return res.status(403).json({ message: 'You have already voted on this issue' });
    }

    // Create vote
    await Vote.create({
      userId: req.user.id,
      issueId: id
    }, { transaction });

    // Increment vote count
    await issue.increment('voteCount', { transaction });
    await issue.reload({ transaction });

    await transaction.commit();

    // Emit WebSocket event
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

// Update issue status (admin only)
const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
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

    // Update status
    await issue.update({ status });

    // Emit WebSocket event
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

// Delete issue (admin or owner)
const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await Issue.findByPk(id);
    
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check permissions - admin or issue owner
    if (req.user.role !== 'admin' && issue.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this issue' });
    }

    await issue.destroy();

    // Emit WebSocket event
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

module.exports = {
  createIssue,
  getIssues,
  getIssueById,
  voteIssue,
  updateIssueStatus,
  deleteIssue
};
