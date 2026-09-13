import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Movie API calls
export const fetchTrendingMovies = async (page = 1) => {
  const response = await api.get(`/movies/trending?page=${page}`);
  return response.data;
};

// Add these below your existing fetchTrendingMovies function
export const fetchTopRatedMovies = async (page = 1) => {
  const response = await api.get(`/movies/top-rated?page=${page}`);
  return response.data;
};

export const fetchMoviesByGenre = async (genreId, page = 1) => {
  const response = await api.get(`/movies/discover?genreId=${genreId}&page=${page}`);
  return response.data;
};

export const searchMovies = async (q, page = 1) => {
  const response = await api.get(`/movies/search?q=${encodeURIComponent(q)}&page=${page}`);
  return response.data;
};

// Wishlist API calls
export const fetchWishlist = async () => {
  const response = await api.get('/wishlist');
  return response.data;
};

export const fetchMovieDetails = async (movieId) => {
  const response = await api.get(`/movies/${movieId}/details`);
  return response.data;
};

export const fetchSimilarMovies = async (movieId, page = 1) => {
  const response = await api.get(`/movies/${movieId}/similar?page=${page}`);
  return response.data;
};

export const addToWishlist = async (movie) => {
  const response = await api.post('/wishlist', {
    movieId: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterUrl: movie.posterUrl,
    backdropUrl: movie.backdropUrl,
    rating: movie.rating,
    releaseDate: movie.releaseDate,
  });
  return response.data;
};

export const removeFromWishlist = async (movieId) => {
  const response = await api.delete(`/wishlist/${movieId}`);
  return response.data;
};

export default api;