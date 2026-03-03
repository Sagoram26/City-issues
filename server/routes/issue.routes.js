const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issue.controller');
const { verifyToken, optionalAuth, isAdmin } = require('../middleware/auth.middleware');
const { upload, handleUploadError } = require('../middleware/upload.middleware');

// Public routes
router.get('/', optionalAuth, issueController.getIssues);
router.get('/:id', optionalAuth, issueController.getIssueById);

// Protected routes (authenticated users)
router.post('/', 
  verifyToken, 
  upload.single('photo'), 
  handleUploadError,
  issueController.createIssue
);

router.post('/:id/vote', verifyToken, issueController.voteIssue);

// Admin only routes
router.patch('/:id/status', verifyToken, isAdmin, issueController.updateIssueStatus);

// Delete (admin or owner)
router.delete('/:id', verifyToken, issueController.deleteIssue);

module.exports = router;
