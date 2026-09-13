const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

/**
 * Normalizes raw movie objects from TMDB API into a standard clean format.
 */
const transformMovie = (movie) => {
  if (!movie) return null;

  return {
    id: movie.id,
    title: movie.title || movie.original_title || 'Untitled',
    overview: movie.overview || 'No overview available for this title.',
    releaseDate: movie.release_date || null,
    rating: movie.vote_average ? Number(movie.vote_average.toFixed(1)) : 0,
    voteCount: movie.vote_count || 0,
    popularity: movie.popularity || 0,
    posterUrl: movie.poster_path 
      ? `${TMDB_IMAGE_BASE_URL}w500${movie.poster_path}` 
      : null,
    backdropUrl: movie.backdrop_path 
      ? `${TMDB_IMAGE_BASE_URL}w1280${movie.backdrop_path}` 
      : null,
    genres: movie.genres ? movie.genres.map(g => g.name) : [],
    genreIds: movie.genre_ids || [],
    runtime: movie.runtime || null,
    tagline: movie.tagline || '',
  };
};

module.exports = { transformMovie };