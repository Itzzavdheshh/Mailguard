// Migration Controller
// Handle data migration tasks for Clerk authentication

const Email = require('../models/Email');
const User = require('../models/User');

/**
 * Migrate all emails to current user
 * POST /api/migration/update-emails
 * @access Protected - requires authentication
 */
exports.migrateEmailsToCurrentUser = async (req, res) => {
  try {
    const currentUserId = req.mongoUserId; // From syncUserMiddleware

    console.log(`🔄 Starting email migration for user: ${currentUserId}`);

    // Get current user info
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log(`👤 Current user: ${currentUser.email} (${currentUser.name})`);

    // Find all emails that don't belong to current user
    const emailsToUpdate = await Email.find({
      userId: { $ne: currentUserId }
    });

    console.log(`📧 Found ${emailsToUpdate.length} emails to migrate`);

    if (emailsToUpdate.length === 0) {
      return res.json({
        success: true,
        message: 'All emails already belong to current user',
        updated: 0
      });
    }

    // Update all emails to current user
    const updateResult = await Email.updateMany(
      { userId: { $ne: currentUserId } },
      { $set: { userId: currentUserId } }
    );

    console.log(`✅ Migration complete: ${updateResult.modifiedCount} emails updated`);

    // Get updated counts
    const totalEmails = await Email.countDocuments({ userId: currentUserId });

    res.json({
      success: true,
      message: 'Email migration completed successfully',
      updated: updateResult.modifiedCount,
      totalEmails: totalEmails,
      user: {
        id: currentUser._id,
        email: currentUser.email,
        name: currentUser.name
      }
    });

  } catch (error) {
    console.error('❌ Migration error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get migration status
 * GET /api/migration/status
 * @access Protected - requires authentication
 */
exports.getMigrationStatus = async (req, res) => {
  try {
    const currentUserId = req.mongoUserId;

    // Count emails by userId
    const userEmailCount = await Email.countDocuments({ userId: currentUserId });
    const otherEmailCount = await Email.countDocuments({ userId: { $ne: currentUserId } });
    const totalEmails = await Email.countDocuments();

    // Get current user info
    const currentUser = await User.findById(currentUserId).select('name email clerkId');

    res.json({
      success: true,
      user: currentUser,
      emailCounts: {
        currentUser: userEmailCount,
        otherUsers: otherEmailCount,
        total: totalEmails
      },
      needsMigration: otherEmailCount > 0
    });

  } catch (error) {
    console.error('❌ Status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
