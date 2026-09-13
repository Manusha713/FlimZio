const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

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



const getExploreMovies = async ({ category = 'popular', page = 1, sortBy = 'popularity.desc', genreId = '' }) => {
  const categoryPaths = {
    popular: '/movie/popular',
    trending: '/trending/movie/week',
    'top-rated': '/movie/top_rated',
    'now-playing': '/movie/now_playing',
    upcoming: '/movie/upcoming',
  };
  const useDiscover = Boolean(genreId) || sortBy !== 'popularity.desc';
  const path = useDiscover ? '/discover/movie' : categoryPaths[category] || categoryPaths.popular;
  const params = { page };

  if (useDiscover) {
    params.sort_by = sortBy;
    if (genreId) params.with_genres = genreId;
  }

  const response = await tmdbClient.get(path, { params });
  return {
    page: response.data.page,
    totalPages: response.data.total_pages,
    totalResults: response.data.total_results,
    results: response.data.results.map(transformMovie),
  };
};

const getGenres = async () => {
  const response = await tmdbClient.get('/genre/movie/list');
  return response.data.genres;
};
const getMovieDetails = async (movieId) => {
  const response = await tmdbClient.get(`/movie/${movieId}`);
  const data = response.data;

  return {
    id: data.id,
    title: data.title,
    tagline: data.tagline,
    overview: data.overview,
    posterPath: data.poster_path ? `${IMAGE_BASE_URL}${data.poster_path}` : null,
    backdropPath: data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : null,
    releaseDate: data.release_date,
    voteAverage: data.vote_average ? data.vote_average.toFixed(1) : 'N/A',
    voteCount: data.vote_count,
    runtime: data.runtime,
    budget: data.budget,
    revenue: data.revenue,
    status: data.status,
    genres: data.genres || [],
    productionCompanies: data.production_companies || [],
  };
};

// Fetch TMDB similar movies recommendation list
const getSimilarMovies = async (movieId, page = 1) => {
  const response = await tmdbClient.get(`/movie/${movieId}/similar`, { params: { page } });
  return {
    page: response.data.page,
    totalPages: response.data.total_pages,
    totalResults: response.data.total_results,
    results: response.data.results.map(transformMovie),
  };
};

module.exports = {
  getTrendingMovies,
  getTopRatedMovies,
  searchMovies,
  getDiscoverMovies,
  getExploreMovies,
  getMovieDetails,
  getGenres,
  getSimilarMovies,
};