import React, { useState, useEffect } from 'react';
import { fetchMovieDetails, fetchSimilarMovies, fetchMoviesByGenre } from '../services/api';
import MovieRow from './MovieRow';
import { ArrowLeft, Star, Clock, Calendar, Heart, DollarSign, Building2 } from 'lucide-react';

export default function MovieDetail({ movieId, onBack, wishlist, onToggleWishlist, onSelectMovie }) {
  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [genreMovies, setGenreMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (movieId) {
      loadMovieDetails();
      window.scrollTo(0, 0);
    }
  }, [movieId]);

  const loadMovieDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const detailsRes = await fetchMovieDetails(movieId);
      const movieData = detailsRes.data || detailsRes;
      setMovie(movieData);

      const similarRes = await fetchSimilarMovies(movieId);
      setSimilarMovies(similarRes.data?.results || similarRes.results || []);

      if (movieData.genres && movieData.genres.length > 0) {
        const primaryGenreId = movieData.genres[0].id;
        const genreRes = await fetchMoviesByGenre(primaryGenreId);
        const filteredGenreMovies = (genreRes.data?.results || genreRes.results || []).filter(
          (m) => m.id !== parseInt(movieId, 10)
        );
        setGenreMovies(filteredGenreMovies);
      }
    } catch (err) {
      setError('Failed to load movie details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p>Loading movie information...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="text-center py-20">
        <p className="text-rose-400 mb-4">{error || 'Movie not found.'}</p>
        <button onClick={onBack} className="bg-slate-800 text-white px-4 py-2 rounded-lg">
          Go Back
        </button>
      </div>
    );
  }

  const isWishlisted = wishlist.some((item) => item.movieId === movie.id);
  const primaryGenreName = movie.genres?.[0]?.name || 'Category';

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return 'N/A';
    return `$${(amount / 1000000).toFixed(1)}M`;
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return 'N/A';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="min-h-screen text-slate-100 pb-12">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 px-4 py-2 rounded-xl border border-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Movies
      </button>

      {/* Hero Header */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 mb-10">
        {movie.backdropPath && (
          <div className="absolute inset-0">
            <img src={movie.backdropPath} alt={movie.title} className="w-full h-full object-cover opacity-20 blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
          </div>
        )}

        <div className="relative p-6 sm:p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start">
          <img
            src={movie.posterPath || 'https://via.placeholder.com/300x450?text=No+Poster'}
            alt={movie.title}
            className="w-full md:w-64 rounded-xl shadow-2xl border border-slate-700/50 object-cover flex-shrink-0"
          />

          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">{movie.title}</h1>
            {movie.tagline && <p className="text-indigo-400 italic text-lg mb-4">"{movie.tagline}"</p>}

            {/* Quick Metadata Pill Container */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300 mb-6">
              <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full font-semibold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{movie.voteAverage} / 10</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-800 px-3 py-1 rounded-full">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{movie.releaseDate ? movie.releaseDate.split('-')[0] : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-800 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{formatRuntime(movie.runtime)}</span>
              </div>
            </div>

            {/* Genres list */}
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres.map((g) => (
                <span key={g.id} className="bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium px-3 py-1 rounded-md">
                  {g.name}
                </span>
              ))}
            </div>

            {/* Action Bar */}
            <button
              onClick={() => onToggleWishlist(movie)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                isWishlisted
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-white' : ''}`} />
              {isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
            </button>

            {/* Overview */}
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-2">Overview</h3>
              <p className="text-slate-300 leading-relaxed max-w-3xl">{movie.overview || 'No description available.'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Extra Financial / Studio Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Budget</p>
            <p className="text-lg font-bold">{formatCurrency(movie.budget)}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Revenue</p>
            <p className="text-lg font-bold">{formatCurrency(movie.revenue)}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Studios</p>
            <p className="text-sm font-semibold truncate max-w-[180px]">
              {movie.productionCompanies.map((c) => c.name).join(', ') || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Row 1: Similar Movies */}
      {similarMovies.length > 0 && (
        <MovieRow
          title="Similar Movies"
          movies={similarMovies}
          wishlist={wishlist}
          onToggleWishlist={onToggleWishlist}
          onSelectMovie={onSelectMovie}
        />
      )}

      {/* Scrollable Row 2: Same Genre Movies */}
      {genreMovies.length > 0 && (
        <MovieRow
          title={`More in ${primaryGenreName}`}
          movies={genreMovies}
          wishlist={wishlist}
          onToggleWishlist={onToggleWishlist}
          onSelectMovie={onSelectMovie}
        />
      )}
    </div>
  );
}