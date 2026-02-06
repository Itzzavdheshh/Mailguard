const NodeCache = require('node-cache');

/**
 * In-memory cache for API responses
 * Configuration:
 * - stdTTL: 30 seconds default time-to-live
 * - checkperiod: Check for expired keys every 60 seconds
 * - useClones: Clone cached objects to prevent mutation
 */
const cache = new NodeCache({
  stdTTL: 30,
  checkperiod: 60,
  useClones: true,
});

/**
 * Cache statistics (for monitoring)
 */
let stats = {
  hits: 0,
  misses: 0,
  sets: 0,
};

/**
 * Middleware to cache GET responses
 * @param {number} duration - Cache duration in seconds (optional, defaults to 30s)
 */
const cacheMiddleware = (duration = 30) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from URL + user ID
    const userId = req.userId || 'anonymous';
    const cacheKey = `${req.originalUrl}_${userId}`;

    try {
      // Check if response is cached
      const cachedResponse = cache.get(cacheKey);

      if (cachedResponse) {
        // Cache hit
        stats.hits++;
        res.set('X-Cache', 'HIT');
        return res.status(200).json(cachedResponse);
      }

      // Cache miss - intercept res.json to cache the response
      stats.misses++;
      const originalJson = res.json.bind(res);

      res.json = (body) => {
        // Only cache successful responses
        if (res.statusCode === 200) {
          cache.set(cacheKey, body, duration);
          stats.sets++;
          res.set('X-Cache', 'MISS');
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error('❌ Cache error:', error.message);
      next(); // Continue without caching on error
    }
  };
};

/**
 * Get cache statistics
 */
const getCacheStats = () => {
  return {
    ...stats,
    keys: cache.keys().length,
    hitRate: stats.hits + stats.misses > 0 
      ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(2) + '%'
      : '0%',
  };
};

/**
 * Clear all cache
 */
const clearCache = () => {
  cache.flushAll();
  console.log('✓ Cache cleared');
};

/**
 * Clear cache for specific pattern
 */
const clearCachePattern = (pattern) => {
  const keys = cache.keys().filter(key => key.includes(pattern));
  cache.del(keys);
  console.log(`✓ Cleared ${keys.length} cache entries matching: ${pattern}`);
};

module.exports = {
  cacheMiddleware,
  getCacheStats,
  clearCache,
  clearCachePattern,
};
