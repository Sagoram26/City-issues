const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Register new user
const register = async (req, res) => {
  try {
    const { email, password, username, role, profileData } = req.body;

    // Validate required fields
    if (!email || !password || !username) {
      return res.status(400).json({ 
        message: 'Email, password, and username are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Validate username length
    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({ 
        message: 'Username must be between 3 and 50 characters' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: { email: email.toLowerCase() } 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Check if username is taken
    const existingUsername = await User.findOne({ 
      where: { username } 
    });
    
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Validate role - only allow 'citizen' for public registration
    // Admin accounts should be created through a different process
    const userRole = (role === 'admin') ? 'citizen' : (role || 'citizen');

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      username,
      role: userRole,
      profileData: profileData || {}
    });

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      token,
      user: user.toSafeObject()
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Email or username already exists' });
    }

    res.status(500).json({ message: 'Registration failed' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    // Find user by email
    const user = await User.findOne({ 
      where: { email: email.toLowerCase() } 
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
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

// Get current user profile
const getProfile = async (req, res) => {
  try {
    res.json(req.user.toSafeObject());
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { username, profileData } = req.body;
    const updates = {};

    if (username) {
      // Check if username is taken by another user
      const existingUsername = await User.findOne({ 
        where: { username } 
      });
      
      if (existingUsername && existingUsername.id !== req.user.id) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      
      updates.username = username;
    }

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

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
