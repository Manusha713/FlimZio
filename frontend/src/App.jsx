import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MovieCard from './components/MovieCard';
import { fetchTrendingMovies, searchMovies, fetchWishlist, addToWishlist, removeFromWishlist } from './services/api';
import { Search, Loader2 } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('trending');
  const [movies, setMovies] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load wishlist on startup
  useEffect(() => {
    loadWishlist();
  }, []);

  // Reset or load data when tab changes
  useEffect(() => {
    setError(null);
    if (activeTab === 'trending') {
      loadTrendingMovies();
    } else if (activeTab === 'search') {
      // Clear old movies when switching to search view
      setMovies([]);
    } else if (activeTab === 'wishlist') {
      loadWishlist();
    }
  }, [activeTab]);

  const loadTrendingMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchTrendingMovies();
      // Access array safely depending on payload format
      const results = res.data?.results || res.results || res.data || [];
      setMovies(results);
    } catch (err) {
      setError('Failed to load trending movies. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = async () => {
    try {
      const res = await fetchWishlist();
      const items = res.data || [];
      setWishlist(items);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const res = await searchMovies(searchQuery);
      const results = res.data?.results || res.results || res.data || [];
      
      setMovies(results);
      if (results.length === 0) {
        setError(`No movies found matching "${searchQuery}".`);
      }
    } catch (err) {
      setError('Failed to search movies. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWishlist = async (movie) => {
    const targetId = movie.movieId || movie.id;
    const isWishlisted = wishlist.some((item) => item.movieId === targetId);

    try {
      if (isWishlisted) {
        await removeFromWishlist(targetId);
        setWishlist((prev) => prev.filter((item) => item.movieId !== targetId));
      } else {
        const res = await addToWishlist(movie);
        setWishlist((prev) => [res.data, ...prev]);
      }
    } catch (err) {
      console.error('Wishlist action failed:', err);
    }
  };

  const isMovieInWishlist = (movieId) => {
    return wishlist.some((item) => item.movieId === movieId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wishlistCount={wishlist.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        {activeTab === 'search' && (
          <form onSubmit={handleSearch} className="mb-8 flex gap-3 max-w-2xl mx-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search for movies by title (e.g., Inception)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 rounded-xl transition-colors"
            >
              Search
            </button>
          </form>
        )}

        {/* Section Heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            {activeTab === 'trending' && 'Trending Movies'}
            {activeTab === 'search' && 'Search Results'}
            {activeTab === 'wishlist' && 'Your Saved Wishlist'}
          </h1>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 mb-6 bg-rose-950/50 border border-rose-800 rounded-xl text-rose-300 text-sm">
            {error}
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
            <p className="text-slate-400 text-sm">Fetching movies...</p>
          </div>
        ) : (
          /* Movie Cards Grid */
          <div>
            {activeTab === 'wishlist' ? (
              wishlist.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                  Your wishlist is empty.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {wishlist.map((item) => (
                    <MovieCard
                      key={item.movieId}
                      movie={{ ...item, id: item.movieId }}
                      isWishlisted={true}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  ))}
                </div>
              )
            ) : (
              movies.length === 0 ? (
                <div className="text-center py-20 text-slate-500">
                  {activeTab === 'search'
                    ? 'Type a movie title above and press Search.'
                    : 'No movies found.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {movies.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      isWishlisted={isMovieInWishlist(movie.id)}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;