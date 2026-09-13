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
  fetchMoviesByGenre,
  fetchSimilarMovies
} from './services/api';
import { Loader2, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('trending');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState([]);
  const [heroOpacity, setHeroOpacity] = useState(1);
  
  // Navigation & Detail States
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [viewingCategory, setViewingCategory] = useState(null);

  // Dashboard row states
  const [homeData, setHomeData] = useState({ trending: [], topRated: [], youMightLike: [], action: [], comedy: [], romance: [] });
  
  // Search & Wishlist states
  const [movies, setMovies] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autocorrectedWord, setAutocorrectedWord] = useState(null);
  const [categoryPageLoading, setCategoryPageLoading] = useState(false);
  const [categoryPageError, setCategoryPageError] = useState(null);

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

  useEffect(() => {
    const updateHeroOpacity = () => {
      setHeroOpacity(Math.max(0, 1 - window.scrollY / 520));
    };

    updateHeroOpacity();
    window.addEventListener('scroll', updateHeroOpacity, { passive: true });
    return () => window.removeEventListener('scroll', updateHeroOpacity);
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

  useEffect(() => {
    let cancelled = false;

    const loadWishlistRecommendations = async () => {
      if (activeTab !== 'trending' || wishlist.length === 0) {
        setHomeData((current) => ({ ...current, youMightLike: [] }));
        return;
      }

      try {
        const savedIds = new Set(wishlist.map((item) => item.movieId || item.id));
        const responses = await Promise.all(
          wishlist.slice(0, 3).map((item) => fetchSimilarMovies(item.movieId || item.id))
        );
        const recommendations = responses
          .flatMap((response) => response?.data?.results || response?.results || [])
          .filter((movie) => movie && !savedIds.has(movie.id));
        const uniqueRecommendations = Array.from(
          new Map(recommendations.map((movie) => [movie.id, movie])).values()
        );

        if (!cancelled) {
          setHomeData((current) => ({ ...current, youMightLike: uniqueRecommendations }));
        }
      } catch (recommendationError) {
        if (!cancelled) {
          setHomeData((current) => ({ ...current, youMightLike: [] }));
        }
      }
    };

    loadWishlistRecommendations();
    return () => {
      cancelled = true;
    };
  }, [activeTab, wishlist]);

  const loadHomeDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [trendRes, topRes, actionRes, comedyRes, romanceRes] = await Promise.all([
        fetchTrendingMovies(),
        fetchTopRatedMovies(),
        fetchMoviesByGenre('28'),
        fetchMoviesByGenre('35'),
        fetchMoviesByGenre('10749')
      ]);

      const extractResults = (res) => res?.data?.results || res?.results || res?.data || [];

      setHomeData({
        trending: extractResults(trendRes),
        topRated: extractResults(topRes),
        action: extractResults(actionRes),
        comedy: extractResults(comedyRes),
        romance: extractResults(romanceRes)
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
    return wishlist.some((item) => String(item.movieId || item.id) === String(movieId));
  };

  const getAvailableHomeMovies = (moviesToFilter = []) => {
    const savedIds = new Set(wishlist.map((item) => String(item.movieId || item.id)));
    return moviesToFilter.filter((movie) => !savedIds.has(String(movie.id)));
  };

  const extractResults = (response) => response?.data?.results || response?.results || response?.data || [];

  const handleShowAll = (title, categoryMovies, loadPage) => {
    setNavigationHistory((history) => [...history, getCurrentView()]);
    setCategoryPageError(null);
    setViewingCategory({
      title,
      movies: getAvailableHomeMovies(categoryMovies),
      page: 1,
      totalPages: 500,
      loadPage,
    });
    setSelectedMovie(null);
    window.scrollTo(0, 0);
  };

  const handleNextCategoryPage = async () => {
    if (!viewingCategory?.loadPage || categoryPageLoading || viewingCategory.page >= viewingCategory.totalPages) return;

    const nextPage = viewingCategory.page + 1;
    try {
      setCategoryPageLoading(true);
      setCategoryPageError(null);
      const response = await viewingCategory.loadPage(nextPage);
      const nextMovies = getAvailableHomeMovies(extractResults(response));

      setViewingCategory((current) => ({
        ...current,
        page: nextPage,
        totalPages: response?.data?.totalPages || response?.totalPages || current.totalPages,
        movies: [...current.movies, ...nextMovies.filter((movie) => !current.movies.some((item) => item.id === movie.id))],
      }));
    } catch (pageError) {
      setCategoryPageError('Unable to load more movies. Please try again.');
    } finally {
      setCategoryPageLoading(false);
    }
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
        {navigationHistory.length > 0 && selectedMovie && (
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
                <section className="relative isolate -mx-1 mb-12 min-h-[260px] overflow-hidden rounded-3xl border border-indigo-400/10 bg-slate-900/30 px-5 py-12 sm:px-10 sm:py-16">
                  <div
                    className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center transition-opacity duration-300"
                    style={{
                      backgroundImage: 'url("https://m.media-amazon.com/images/I/817rFOdsCFL._AC_UF894,1000_QL80_.jpg")',
                      opacity: heroOpacity * 0.7,
                    }}
                  />
                  <div className="pointer-events-none absolute inset-y-0 left-0 -z-10 w-1/2 bg-gradient-to-r from-slate-950/25 via-slate-950/5 to-transparent" />
                  <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/85 via-slate-950/35 to-slate-950/10" />
                  <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/15" />
                  <div className="relative max-w-2xl">
                    <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">Your Next Watch</h1>
                    <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">
                      Explore popular, trending, and highly rated movies and find something worth watching.
                    </p>
                  </div>
                </section>
                <MovieRow 
                  title="Trending Movies" 
                  movies={getAvailableHomeMovies(homeData.trending)} 
                  wishlist={wishlist} 
                  onToggleWishlist={handleToggleWishlist}
                  onSelectMovie={handleSelectMovie}
                  onShowAll={() => handleShowAll("Trending Movies", homeData.trending, fetchTrendingMovies)} 
                />
                <MovieRow 
                  title="Top Rated" 
                  movies={getAvailableHomeMovies(homeData.topRated)} 
                  wishlist={wishlist} 
                  onToggleWishlist={handleToggleWishlist}
                  onSelectMovie={handleSelectMovie}
                  onShowAll={() => handleShowAll("Top Rated", homeData.topRated, fetchTopRatedMovies)} 
                />
                <MovieRow
                  title="You Might Like"
                  movies={getAvailableHomeMovies(homeData.youMightLike)}
                  wishlist={wishlist}
                  onToggleWishlist={handleToggleWishlist}
                  onSelectMovie={handleSelectMovie}
                />
                <MovieRow 
                  title="Action Blockbusters" 
                  movies={getAvailableHomeMovies(homeData.action)} 
                  wishlist={wishlist} 
                  onToggleWishlist={handleToggleWishlist}
                  onSelectMovie={handleSelectMovie}
                  onShowAll={() => handleShowAll("Action Blockbusters", homeData.action, (page) => fetchMoviesByGenre('28', page))} 
                />
                <MovieRow
                  title="Tales of Love"
                  movies={getAvailableHomeMovies(homeData.romance)}
                  wishlist={wishlist}
                  onToggleWishlist={handleToggleWishlist}
                  onSelectMovie={handleSelectMovie}
                  onShowAll={() => handleShowAll("Tales of Love", homeData.romance, (page) => fetchMoviesByGenre('10749', page))}
                />
                <MovieRow 
                  title="Comedy Hits" 
                  movies={getAvailableHomeMovies(homeData.comedy)} 
                  wishlist={wishlist} 
                  onToggleWishlist={handleToggleWishlist}
                  onSelectMovie={handleSelectMovie}
                  onShowAll={() => handleShowAll("Comedy Hits", homeData.comedy, (page) => fetchMoviesByGenre('35', page))} 
                />
                <button
                  type="button"
                  onClick={() => handleTabChange('explore')}
                  className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl border border-indigo-400/20 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 px-5 py-5 text-left shadow-xl shadow-indigo-950/10 transition-all duration-300 hover:border-indigo-400/50 hover:from-indigo-900/70 sm:px-7 sm:py-6"
                >
                  <span className="relative">
                    <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Keep exploring</span>
                    <span className="mt-1 block text-lg font-bold text-white sm:text-xl">Discover more movies</span>
                    <span className="mt-1 block text-sm text-slate-400">Find your next favorite beyond the home collections.</span>
                  </span>
                  <span className="ml-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-indigo-300/30 bg-indigo-500/20 text-indigo-200 transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-indigo-500/40 sm:h-14 sm:w-14">
                    <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                </button>
              </div>
            )}

            {/* Category Full-Grid View */}
            {activeTab === 'trending' && viewingCategory && (
              <div>
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

                {categoryPageError && (
                  <p className="mt-6 text-center text-sm text-rose-400">{categoryPageError}</p>
                )}

                {viewingCategory.page < viewingCategory.totalPages && (
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={handleNextCategoryPage}
                      disabled={categoryPageLoading}
                      className="flex min-w-40 items-center justify-center rounded-xl border border-indigo-500/40 bg-indigo-600/15 px-5 py-3 text-sm font-semibold text-indigo-200 transition-colors hover:border-indigo-400 hover:bg-indigo-600/30 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {categoryPageLoading ? 'Loading more...' : 'Next Page'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;