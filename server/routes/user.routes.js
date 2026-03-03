const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Public routes
router.get('/:id', userController.getUserById);
router.get('/:id/issues', userController.getUserIssues);

// Admin only routes
router.get('/', verifyToken, isAdmin, userController.getAllUsers);
router.patch('/:id/role', verifyToken, isAdmin, userController.updateUserRole);

module.exports = router;
