import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MovieCard from './components/MovieCard';
import MovieRow from './components/MovieRow';
import { 
  fetchTrendingMovies, 
  searchMovies, 
  fetchWishlist, 
  addToWishlist, 
  removeFromWishlist,
  fetchTopRatedMovies,
  fetchMoviesByGenre
} from './services/api';
import { Search, Loader2, Sparkles, ArrowLeft } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('trending');
  
  // Dashboard row states
  const [homeData, setHomeData] = useState({ trending: [], topRated: [], action: [], comedy: [] });
  const [viewingCategory, setViewingCategory] = useState(null);
  
  // Search & Wishlist states
  const [movies, setMovies] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autocorrectedWord, setAutocorrectedWord] = useState(null);

  // Load wishlist on initial startup
  useEffect(() => {
    loadWishlist();
  }, []);

  // Reset or load data when tab changes
  useEffect(() => {
    setError(null);
    setAutocorrectedWord(null);
    setViewingCategory(null);
    
    if (activeTab === 'trending') {
      loadHomeDashboard();
    } else if (activeTab === 'search') {
      setMovies([]);
    } else if (activeTab === 'wishlist') {
      loadWishlist();
    }
  }, [activeTab]);

  const loadHomeDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [trendRes, topRes, actionRes, comedyRes] = await Promise.all([
        fetchTrendingMovies(),
        fetchTopRatedMovies(),
        fetchMoviesByGenre('28'),
        fetchMoviesByGenre('35')
      ]);

      const extractResults = (res) => res?.data?.results || res?.results || res?.data || [];

      setHomeData({
        trending: extractResults(trendRes),
        topRated: extractResults(topRes),
        action: extractResults(actionRes),
        comedy: extractResults(comedyRes)
      });
    } catch (err) {
      setError('Failed to load home dashboard. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = async () => {
    try {
      const res = await fetchWishlist();
      const items = res?.data || [];
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
      setAutocorrectedWord(null);
      
      const res = await searchMovies(searchQuery);
      const results = res?.data?.results || res?.results || res?.data || [];
      
      setMovies(results);
      
      const corrected = res?.data?.autocorrectedTo || res?.autocorrectedTo;
      if (corrected) {
        setAutocorrectedWord(corrected);
      } else if (results.length === 0) {
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

  const handleShowAll = (title, categoryMovies) => {
    setViewingCategory({ title, movies: categoryMovies });
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-10">
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

        {/* Section Heading & Navigation */}
        <div className="mb-6 flex items-center">
          {activeTab === 'trending' && viewingCategory && (
            <button 
              onClick={() => setViewingCategory(null)}
              className="mr-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-2xl font-bold tracking-tight">
            {activeTab === 'trending' && !viewingCategory && 'Home Dashboard'}
            {activeTab === 'trending' && viewingCategory && `All ${viewingCategory.title}`}
            {activeTab === 'search' && 'Search Results'}
            {activeTab === 'wishlist' && 'Your Saved Wishlist'}
          </h1>
        </div>

        {/* Notifications */}
        {autocorrectedWord && (
          <div className="mb-6 p-4 bg-indigo-950/60 border border-indigo-700 rounded-xl text-indigo-200 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>
              Showing results for <strong className="text-white font-semibold">{autocorrectedWord}</strong> instead of <em>"{searchQuery}"</em>.
            </span>
          </div>
        )}

        {error && (
          <div className="p-4 mb-6 bg-rose-950/50 border border-rose-800 rounded-xl text-rose-300 text-sm">
            {error}
          </div>
        )}

        {/* Loading Spinner or Grid Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
            <p className="text-slate-400 text-sm">Fetching movies...</p>
          </div>
        ) : (
          <div>
            {/* Wishlist View */}
            {activeTab === 'wishlist' && (
              wishlist.length === 0 ? (
                <div className="text-center py-20 text-slate-500">Your wishlist is empty.</div>
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
            )}

            {/* Search View */}
            {activeTab === 'search' && (
              movies.length === 0 ? (
                <div className="text-center py-20 text-slate-500">Type a movie title above and press Search.</div>
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

            {/* Dashboard Rows View */}
            {activeTab === 'trending' && !viewingCategory && (
              <div className="space-y-4">
                <MovieRow 
                  title="Trending Movies" 
                  movies={homeData.trending} 
                  wishlist={wishlist} 
                  onToggleWishlist={handleToggleWishlist}
                  onShowAll={() => handleShowAll("Trending Movies", homeData.trending)} 
                />
                <MovieRow 
                  title="Top Rated" 
                  movies={homeData.topRated} 
                  wishlist={wishlist} 
                  onToggleWishlist={handleToggleWishlist}
                  onShowAll={() => handleShowAll("Top Rated", homeData.topRated)} 
                />
                <MovieRow 
                  title="Action Blockbusters" 
                  movies={homeData.action} 
                  wishlist={wishlist} 
                  onToggleWishlist={handleToggleWishlist}
                  onShowAll={() => handleShowAll("Action Blockbusters", homeData.action)} 
                />
                <MovieRow 
                  title="Comedy Hits" 
                  movies={homeData.comedy} 
                  wishlist={wishlist} 
                  onToggleWishlist={handleToggleWishlist}
                  onShowAll={() => handleShowAll("Comedy Hits", homeData.comedy)} 
                />
              </div>
            )}

            {/* Category Full-Grid View */}
            {activeTab === 'trending' && viewingCategory && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {viewingCategory.movies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    isWishlisted={isMovieInWishlist(movie.id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;