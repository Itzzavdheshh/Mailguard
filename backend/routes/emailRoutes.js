// Email Routes
// API endpoints for email classification

const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const authMiddleware = require('../middleware/authMiddleware');
const syncUserMiddleware = require('../middleware/syncUserMiddleware');
const { validate, schemas } = require('../middleware/validation');
const { cacheMiddleware } = require('../middleware/cache');
const { classifyLimiter, bulkOperationLimiter } = require('../middleware/rateLimiter');

// All email routes require authentication and user sync
router.use(authMiddleware);
router.use(syncUserMiddleware);

// Classify all unclassified emails
router.post('/classify', classifyLimiter, validate(schemas.classifyEmails), emailController.classifyEmails);

// Get classification statistics (cached for 30s)
router.get('/stats', cacheMiddleware(30), emailController.getClassificationStats);

// Get all emails (alias for /classified for backward compatibility)
router.get('/', validate(schemas.emailQuery, 'query'), emailController.getClassifiedEmails);

// Get classified emails
router.get('/classified', validate(schemas.emailQuery, 'query'), emailController.getClassifiedEmails);

// Delete a single email
router.delete('/:id', validate(schemas.idParam, 'params'), emailController.deleteEmail);

// Bulk delete multiple emails
router.post('/bulk-delete', bulkOperationLimiter, validate(schemas.bulkOperation), emailController.bulkDeleteEmails);

// Auto clean all phishing emails
router.post('/clean-phishing', bulkOperationLimiter, emailController.cleanPhishingEmails);

module.exports = router;
