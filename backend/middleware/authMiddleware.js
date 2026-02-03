// Import Clerk SDK for authentication
const { clerkClient } = require('@clerk/clerk-sdk-node');

/**
 * CLERK AUTHENTICATION MIDDLEWARE
 * Protects routes by verifying Clerk session token
 * Attaches userId (Clerk user ID) to request object for use in protected routes
 * 
 * Usage: Add this middleware to any route that requires authentication
 * Example: router.get('/profile', authMiddleware, getProfile);
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    // Expected format: "Bearer <token>"
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Check if header follows "Bearer <token>" format
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format. Use: Bearer <token>',
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(' ')[1];

    // Verify token is present
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Verify the Clerk session token
    const sessionClaims = await clerkClient.verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY
    });

    // Attach Clerk userId to request object
    // This makes the userId available in all protected route handlers
    req.userId = sessionClaims.sub;

    // Call next middleware or route handler
    next();
  } catch (error) {
    // Handle Clerk token verification errors
    console.error('Clerk auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please login again.',
    });
  }
};

// Export the middleware
module.exports = authMiddleware;
module.exports = authMiddleware;
