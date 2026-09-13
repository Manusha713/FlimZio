const tmdbClient = require('../config/tmdb');
const { transformMovie } = require('../utils/transformMovieData');

const getTrendingMovies = async (page = 1) => {
  const response = await tmdbClient.get('/trending/movie/day', {
    params: { page },
  });
  return {
    page: response.data.page,
    totalPages: response.data.total_pages,
    totalResults: response.data.total_results,
    results: response.data.results.map(transformMovie),
  };
};

const searchMovies = async (q, page = 1) => {
  const response = await tmdbClient.get('/search/movie', {
    params: {query: q, page },
  });
  return {
    page: response.data.page,
    totalPages: response.data.total_pages,
    totalResults: response.data.total_results,
    results: response.data.results.map(transformMovie),
  };
};

const getDiscoverMovies = async ({ page = 1, sortBy = 'popularity.desc', genreId = '' }) => {
  const params = {
    page,
    sort_by: sortBy,
  };
  if (genreId) {
    params.with_genres = genreId;
  }

  const response = await tmdbClient.get('/discover/movie', { params });
  return {
    page: response.data.page,
    totalPages: response.data.total_pages,
    totalResults: response.data.total_results,
    results: response.data.results.map(transformMovie),
  };
};

const getMovieDetails = async (id) => {
  const response = await tmdbClient.get(`/movie/${id}`);
  return transformMovie(response.data);
};

const getGenres = async () => {
  const response = await tmdbClient.get('/genre/movie/list');
  return response.data.genres;
};

module.exports = {
  getTrendingMovies,
  searchMovies,
  getDiscoverMovies,
  getMovieDetails,
  getGenres,
};