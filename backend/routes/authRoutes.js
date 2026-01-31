// Import Express router
const express = require('express');
const router = express.Router();

// Import auth controller functions
const { register, login } = require('../controllers/authController');

// Import auth middleware for protected routes
const authMiddleware = require('../middleware/authMiddleware');

/**
 * AUTHENTICATION ROUTES
 * All routes are prefixed with /api/auth (defined in server.js)
 */

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    { name, email, password }
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Login existing user
 * @access  Public
 * @body    { email, password }
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token and get user info
 * @access  Protected (requires valid JWT token)
 * @header  Authorization: Bearer <token>
 */
router.get('/verify', authMiddleware, async (req, res) => {
  try {
    // Get user from database using userId from middleware
    const User = require('../models/User');
    const user = await User.findById(req.userId).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// Export the router
module.exports = router;
