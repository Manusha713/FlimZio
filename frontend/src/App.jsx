import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MovieCard from './components/MovieCard';
import MovieRow from './components/MovieRow';
import MovieDetail from './components/MovieDetail';
import Explore from './pages/Explore';
import { 
  fetchTrendingMovies, 
  searchMovies, 
  fetchWishlist, 
  addToWishlist, 
  removeFromWishlist,
  fetchTopRatedMovies,
  fetchMoviesByGenre
} from './services/api';
import { Loader2, Sparkles, ArrowLeft } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('trending');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState([]);
  
  // Navigation & Detail States
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [viewingCategory, setViewingCategory] = useState(null);

  // Dashboard row states
  const [homeData, setHomeData] = useState({ trending: [], topRated: [], action: [], comedy: [] });
  
  // Search & Wishlist states
  const [movies, setMovies] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autocorrectedWord, setAutocorrectedWord] = useState(null);

  const getCurrentView = () => ({
    activeTab,
    selectedMovie,
    viewingCategory,
    searchQuery,
  });

  const handleTabChange = (nextTab) => {
    if (nextTab === activeTab) return;
    setNavigationHistory((history) => [...history, getCurrentView()]);
    setSelectedMovie(null);
    setViewingCategory(null);
    setSearchExpanded(nextTab === 'search');
    setActiveTab(nextTab);
  };

  const handleOpenSearch = () => {
    setSearchExpanded(true);
  };

  const handleHome = () => {
    setActiveTab('trending');
    setSelectedMovie(null);
    setViewingCategory(null);
    setSearchExpanded(false);
  };

  const handleBack = () => {
    setNavigationHistory((history) => {
      const previousView = history[history.length - 1];
      if (!previousView) return history;

      setActiveTab(previousView.activeTab);
      setSelectedMovie(previousView.selectedMovie);
      setViewingCategory(previousView.viewingCategory);
      setSearchQuery(previousView.searchQuery);
      setSearchExpanded(previousView.activeTab === 'search');
      return history.slice(0, -1);
    });
  };

  // Load wishlist on initial startup
  useEffect(() => {
    loadWishlist();
  }, []);

  // Reset states when tab changes
  useEffect(() => {
    setError(null);
    setAutocorrectedWord(null);
    if (activeTab === 'trending') {
      loadHomeDashboard();
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

    if (activeTab !== 'search') {
      handleTabChange('search');
    }

    try {
      setLoading(true);
      setError(null);
      setAutocorrectedWord(null);
      setSelectedMovie(null);
      
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
    setNavigationHistory((history) => [...history, getCurrentView()]);
    setViewingCategory({ title, movies: categoryMovies });
    setSelectedMovie(null);
    window.scrollTo(0, 0);
  };

  const handleSelectMovie = (movie) => {
    setNavigationHistory((history) => [...history, getCurrentView()]);
    setSelectedMovie(movie);
    window.scrollTo(0, 0);
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 font-sans pb-10">
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onHome={handleHome}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        searchExpanded={searchExpanded}
        onOpenSearch={handleOpenSearch}
      />

      <main className="w-full max-w-none min-w-0 px-4 sm:px-8 lg:px-12 py-8">
        {navigationHistory.length > 0 && (activeTab !== 'trending' || selectedMovie) && (
          <div className="flex justify-end mb-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-sm font-medium text-slate-300 shadow-lg hover:bg-slate-800 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        )}

        {/* Section Heading & Navigation */}
        {!selectedMovie && (
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
              {activeTab === 'trending' && viewingCategory && `All ${viewingCategory.title}`}
              {activeTab === 'search' && 'Search Results'}
              {activeTab === 'wishlist' && 'Your Saved Wishlist'}
            </h1>
          </div>
        )}

        {/* Notifications */}
        {autocorrectedWord && !selectedMovie && (
          <div className="mb-6 p-4 bg-indigo-950/60 border border-indigo-700 rounded-xl text-indigo-200 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span>
              Showing results for <strong className="text-white font-semibold">{autocorrectedWord}</strong> instead of <em>"{searchQuery}"</em>.
            </span>
          </div>
        )}

        {error && !selectedMovie && (
          <div className="p-4 mb-6 bg-rose-950/50 border border-rose-800 rounded-xl text-rose-300 text-sm">
            {error}
          </div>
        )}

        {/* Render Selected Movie View */}
        {selectedMovie ? (
          <MovieDetail 
            movieId={selectedMovie.id} 
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onSelectMovie={handleSelectMovie}
            
          />
        ) : activeTab === 'explore' ? (
          <Explore
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onSelectMovie={handleSelectMovie}
          />
        ) : loading ? (
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
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                  {wishlist.map((item) => (
                    <MovieCard
                      key={item.movieId || item.id}
                      movie={{ ...item, id: item.movieId || item.id }}
                      isWishlisted={true}
                      onToggleWishlist={handleToggleWishlist}
                      onSelectMovie={handleSelectMovie}
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
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                  {movies.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      isWishlisted={isMovieInWishlist(movie.id)}
                      onToggleWishlist={handleToggleWishlist}
                      onSelectMovie={handleSelectMovie}
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
                  onSelectMovie={handleSelectMovie}
                  onShowAll={() => handleShowAll("Trending Movies", homeData.trending)} 
                />
                <MovieRow 
                  title="Top Rated" 
                  movies={homeData.topRated} 
                  wishlist={wishlist} 
                  onToggleWishlist={handleToggleWishlist}
                  onSelectMovie={handleSelectMovie}
                  onShowAll={() => handleShowAll("Top Rated", homeData.topRated)} 
                />
                <MovieRow 
                  title="Action Blockbusters" 
                  movies={homeData.action} 
                  wishlist={wishlist} 
                  onToggleWishlist={handleToggleWishlist}
                  onSelectMovie={handleSelectMovie}
                  onShowAll={() => handleShowAll("Action Blockbusters", homeData.action)} 
                />
                <MovieRow 
                  title="Comedy Hits" 
                  movies={homeData.comedy} 
                  wishlist={wishlist} 
                  onToggleWishlist={handleToggleWishlist}
                  onSelectMovie={handleSelectMovie}
                  onShowAll={() => handleShowAll("Comedy Hits", homeData.comedy)} 
                />
              </div>
            )}

            {/* Category Full-Grid View */}
            {activeTab === 'trending' && viewingCategory && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                {viewingCategory.movies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    isWishlisted={isMovieInWishlist(movie.id)}
                    onToggleWishlist={handleToggleWishlist}
                    onSelectMovie={handleSelectMovie}
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