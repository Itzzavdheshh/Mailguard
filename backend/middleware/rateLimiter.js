/**
 * RATE LIMITING MIDDLEWARE
 * Protects API from abuse by limiting requests per IP address
 * Prevents brute force attacks and API abuse
 */

const rateLimit = require('express-rate-limit');

// Check if running in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

/**
 * General API rate limiter
 * Development: 1000 requests per 15 minutes per IP
 * Production: 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 100, // Much higher limit in development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Skip rate limiting for health checks
  skip: (req) => req.path.startsWith('/health'),
});

/**
 * Strict rate limiter for authentication-heavy operations
 * Development: 200 requests per 15 minutes per IP
 * Production: 20 requests per 15 minutes per IP
 */
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 200 : 20,
  message: {
    success: false,
    message: 'Too many attempts. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Gmail fetch rate limiter
 * More restrictive to prevent Gmail API quota exhaustion
 * Development: 100 fetch requests per hour per IP
 * Production: 10 fetch requests per hour per IP
 */
const gmailFetchLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDevelopment ? 100 : 10,
  message: {
    success: false,
    message: 'Gmail fetch rate limit exceeded. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * ML classification rate limiter
 * Protects ML service from overload
 * Development: 300 classification requests per 15 minutes per IP
 * Production: 30 classification requests per 15 minutes per IP
 */
const classifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 300 : 30,
  message: {
    success: false,
    message: 'Classification rate limit exceeded. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Bulk/destructive operations rate limiter
 * Prevents abuse of bulk delete and clean operations
 * Allows 5 bulk operations per hour per IP
 */
const bulkOperationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit to 5 bulk operations per hour
  message: {
    success: false,
    message: 'Bulk operation rate limit exceeded. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Admin operations rate limiter
 * Extremely restrictive for expensive admin operations
 * Development: 20 admin operations per day per IP
 * Production: 2 admin operations per day per IP
 */
const adminOperationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours (1 day)
  max: isDevelopment ? 20 : 2,
  message: {
    success: false,
    message: 'Admin operation rate limit exceeded. Only 2 operations allowed per day.',
    retryAfter: '24 hours'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Feedback submission rate limiter
 * Prevents feedback spam and training data poisoning
 * Allows 20 feedback submissions per hour per IP
 */
const feedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit to 20 feedback submissions per hour
  message: {
    success: false,
    message: 'Feedback submission rate limit exceeded. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  strictLimiter,
  gmailFetchLimiter,
  classifyLimiter,
  bulkOperationLimiter,
  adminOperationLimiter,
  feedbackLimiter
};
