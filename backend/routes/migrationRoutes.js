// Migration Routes
// Handle data migration endpoints

const express = require('express');
const router = express.Router();
const migrationController = require('../controllers/migrationController');
const authMiddleware = require('../middleware/authMiddleware');
const syncUserMiddleware = require('../middleware/syncUserMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(syncUserMiddleware);

// POST /api/migration/update-emails - Migrate all emails to current user
router.post('/update-emails', migrationController.migrateEmailsToCurrentUser);

// GET /api/migration/status - Get migration status
router.get('/status', migrationController.getMigrationStatus);

module.exports = router;
