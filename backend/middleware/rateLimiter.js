/**
 * RATE LIMITING MIDDLEWARE
 * Protects API from abuse by limiting requests per IP address
 * Prevents brute force attacks and API abuse
 */

const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * Allows 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
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
 * Allows 20 requests per 15 minutes per IP
 */
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
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
 * Allows 10 fetch requests per hour per IP
 */
const gmailFetchLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 fetch requests per hour
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
 * Allows 30 classification requests per 15 minutes per IP
 */
const classifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit to 30 classification requests per 15 minutes
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
 * Allows 2 admin operations per day per IP
 */
const adminOperationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours (1 day)
  max: 2, // Limit to 2 admin operations per day
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
