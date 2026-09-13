const tmdbClient = require('../config/tmdb');
const { transformMovie } = require('../utils/transformMovieData');
const axios = require('axios'); // Added for Datamuse API

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
  // 1. Initial strict search to TMDB
  let response = await tmdbClient.get('/search/movie', {
    params: { query: q, page },
  });

  let autocorrectedWord = null;

  // 2. If TMDB finds zero results, check Datamuse for typos
  if (response.data.results.length === 0) {
    try {
      // We use standard axios here because tmdbClient has TMDB base URLs/keys attached
      const spellCheck = await axios.get(`https://api.datamuse.com/sug?s=${encodeURIComponent(q)}`);
      
      if (spellCheck.data && spellCheck.data.length > 0) {
        autocorrectedWord = spellCheck.data[0].word;
        
        // 3. Re-query TMDB with the corrected word
        response = await tmdbClient.get('/search/movie', {
          params: { query: autocorrectedWord, page },
        });
      }
    } catch (error) {
      console.error('Spell check fallback failed:', error.message);
    }
  }

  // 4. Transform and return data, adding the autocorrect flag if needed
  const returnData = {
    page: response.data.page,
    totalPages: response.data.total_pages,
    totalResults: response.data.total_results,
    results: response.data.results.map(transformMovie),
  };

  if (autocorrectedWord) {
    returnData.autocorrectedTo = autocorrectedWord;
  }

  return returnData;
};

const getTopRatedMovies = async (page = 1) => {
  const response = await tmdbClient.get('/movie/top_rated', { params: { page } });
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
  getTopRatedMovies,
  searchMovies,
  getDiscoverMovies,
  getMovieDetails,
  getGenres,
};