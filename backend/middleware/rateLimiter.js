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

module.exports = {
  apiLimiter,
  strictLimiter,
  gmailFetchLimiter
};
