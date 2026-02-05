// Admin Routes
// API endpoints for administrative operations

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const syncUserMiddleware = require('../middleware/syncUserMiddleware');

// All admin routes require authentication and user sync
// In production, add additional admin role check
router.use(authMiddleware);
router.use(syncUserMiddleware);

/**
 * POST /api/admin/retrain
 * Trigger model retraining
 * Body (optional):
 * {
 *   dataFile: "training.csv",
 *   modelType: "random_forest" or "logistic"
 * }
 */
router.post('/retrain', adminController.triggerRetraining);

/**
 * GET /api/admin/retrain/status
 * Get current retraining/model status
 */
router.get('/retrain/status', adminController.getRetrainingStatus);

/**
 * POST /api/admin/dataset/build
 * Build training dataset from emails and feedback
 * Body (optional):
 * {
 *   outputFile: "training.csv"
 * }
 */
router.post('/dataset/build', adminController.buildDataset);

module.exports = router;
