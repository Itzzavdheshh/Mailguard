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
    // Validate Clerk secret key is configured
    if (!process.env.CLERK_SECRET_KEY) {
      console.error('❌ FATAL: CLERK_SECRET_KEY is not configured');
      return res.status(500).json({
        success: false,
        message: 'Authentication service is not configured',
      });
    }

    // Get token from Authorization header
    // Expected format: "Bearer <token>"
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists
    if (!authHeader) {
      console.warn('⚠️  Unauthorized access attempt: No authorization header');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Check if header follows "Bearer <token>" format
    if (!authHeader.startsWith('Bearer ')) {
      console.warn('⚠️  Unauthorized access attempt: Invalid token format');
      return res.status(401).json({
        success: false,
        message: 'Invalid token format. Use: Bearer <token>',
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(' ')[1];

    // Verify token is present and trim whitespace
    if (!token || token.trim() === '') {
      console.warn('⚠️  Unauthorized access attempt: Empty token');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Verify the Clerk session token
    const sessionClaims = await clerkClient.verifyToken(token.trim(), {
      secretKey: process.env.CLERK_SECRET_KEY
    });

    // Validate session claims contain user ID
    if (!sessionClaims || !sessionClaims.sub) {
      console.warn('⚠️  Invalid session claims: Missing user ID');
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Missing user information.',
      });
    }

    // Attach Clerk userId to request object
    // This makes the userId available in all protected route handlers
    req.userId = sessionClaims.sub;

    // Log successful authentication (in production, consider rate-limiting these logs)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ User authenticated: ${req.userId.substring(0, 10)}...`);
    }

    // Call next middleware or route handler
    next();
  } catch (error) {
    // Handle Clerk token verification errors
    console.error('❌ Clerk auth middleware error:', error.message);
    
    // Provide specific error messages based on error type
    if (error.message?.includes('expired')) {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
    }
    
    if (error.message?.includes('invalid')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.',
      });
    }

    // Generic authentication error
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Please login again.',
    });
  }
};

// Export the middleware
module.exports = authMiddleware;
