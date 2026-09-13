const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const cacheMiddleware = require('../middleware/cacheMiddleware');

router.get('/:id/details', cacheMiddleware(900), movieController.getMovieDetails);
router.get('/:id/similar', cacheMiddleware(900), movieController.getSimilarMovies);
// Genres rarely change: cache for 1 day (86,400 seconds)
router.get('/genres', cacheMiddleware(86400), movieController.getGenres);
router.get('/top-rated', cacheMiddleware(900), movieController.getTopRated);
// Trending, Search, Discovery, and Details cached for 15 minutes (900 seconds)
router.get('/trending', cacheMiddleware(900), movieController.getTrending);
router.get('/search', cacheMiddleware(900), movieController.search);
router.get('/discover', cacheMiddleware(900), movieController.discover);
router.get('/:id', cacheMiddleware(900), movieController.getDetails);

module.exports = router;