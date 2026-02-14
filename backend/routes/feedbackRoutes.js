// Feedback Routes
// API endpoints for user feedback on email classifications

const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const authMiddleware = require('../middleware/authMiddleware');
const syncUserMiddleware = require('../middleware/syncUserMiddleware');
const { validate, schemas } = require('../middleware/validation');
const { feedbackLimiter } = require('../middleware/rateLimiter');
const { invalidateCacheMiddleware, cacheMiddleware, cachePresets } = require('../middleware/cacheMiddleware');

// All feedback routes require authentication
router.use(authMiddleware);
router.use(syncUserMiddleware);

/**
 * POST /api/feedback
 * Submit feedback on an email classification
 * Body: { emailId, correctLabel, notes? }
 * INVALIDATES: User cache and feedback cache after feedback submission
 */
router.post('/', 
  feedbackLimiter, 
  validate(schemas.feedback), 
  invalidateCacheMiddleware({ resource: 'stats' }), // Invalidate stats after feedback
  invalidateCacheMiddleware({ resource: 'feedback' }), // Invalidate feedback list cache
  feedbackController.submitFeedback
);

/**
 * GET /api/feedback
 * Get all feedback submitted by the current user
 * CACHED: 5 minutes
 */
router.get('/', 
  validate(schemas.emailQuery, 'query'), 
  cacheMiddleware(cachePresets.standard),
  feedbackController.getUserFeedback
);

/**
 * GET /api/feedback/stats
 * Get feedback statistics (user and global)
 * CACHED: 3 minutes
 */
router.get('/stats', 
  cacheMiddleware(cachePresets.stats),
  feedbackController.getFeedbackStats
);

/**
 * DELETE /api/feedback/:id
 * Delete a specific feedback entry
 * INVALIDATES: Stats and feedback cache after deletion
 */
router.delete('/:id', 
  validate(schemas.idParam, 'params'), 
  invalidateCacheMiddleware({ resource: 'stats' }), // Invalidate stats after delete
  invalidateCacheMiddleware({ resource: 'feedback' }), // Invalidate feedback list cache
  feedbackController.deleteFeedback
);

module.exports = router;
