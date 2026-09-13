const NodeCache = require('node-cache');

// Standard TTL (Time To Live) set to 15 minutes (900 seconds)
const cache = new NodeCache({ stdTTL: 900, checkperiod: 120 });

/**
 * Express middleware to cache GET requests based on original URL
 * @param {number} duration - Cache duration in seconds (optional override)
 */
const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl || req.url;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      console.log(`[CACHE HIT] Serving from memory for key: ${key}`);
      return res.json(cachedResponse);
    }

    console.log(`[CACHE MISS] Fetching from TMDB for key: ${key}`);

    // Intercept res.json to store the response payload in cache before sending
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, body, duration || 900);
      }
      return originalJson(body);
    };

    next();
  };
};

module.exports = cacheMiddleware;