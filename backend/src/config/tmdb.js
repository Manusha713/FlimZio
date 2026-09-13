const axios = require('axios');

const tmdbClient = axios.create({
  baseURL: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  params: {
    api_key: process.env.TMDB_API_KEY,
  },
  timeout: 8000, // 8-second request timeout threshold
});

module.exports = tmdbClient;