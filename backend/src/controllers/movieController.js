const tmdbService = require('../services/tmdbService');

const getTrending = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const data = await tmdbService.getTrendingMovies(page);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const search = async (req, res, next) => {
  try {
    const { q, page } = req.query;
    if (!q || q.trim() === '') {
      return res.status(400).json({ success: false, message: 'Query parameter "q" is required.' });
    }
    const data = await tmdbService.searchMovies(q, parseInt(page, 10) || 1);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getTopRated = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const data = await tmdbService.getTopRatedMovies(page);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const discover = async (req, res, next) => {
  try {
    const { page, sortBy, genreId } = req.query;
    const data = await tmdbService.getDiscoverMovies({
      page: parseInt(page, 10) || 1,
      sortBy: sortBy || 'popularity.desc',
      genreId: genreId || '',
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const explore = async (req, res, next) => {
  try {
    const { category, page, sortBy, genreId } = req.query;
    const data = await tmdbService.getExploreMovies({
      category: category || 'popular',
      page: parseInt(page, 10) || 1,
      sortBy: sortBy || 'popularity.desc',
      genreId: genreId || '',
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getMovieDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await tmdbService.getMovieDetails(id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getSimilarMovies = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const data = await tmdbService.getSimilarMovies(id, page);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await tmdbService.getMovieDetails(id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getGenres = async (req, res, next) => {
  try {
    const genres = await tmdbService.getGenres();
    res.json({ success: true, data: genres });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTrending,
  search,
  getTopRated,
  discover,
  explore,
  getDetails,
  getGenres,
  getSimilarMovies,
  getMovieDetails,
};