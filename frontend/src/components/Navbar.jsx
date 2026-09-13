import React, { useEffect, useRef } from 'react';
import { Disc3, Heart, Search, Compass } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab, onHome, searchQuery, setSearchQuery, onSearch, searchExpanded, onOpenSearch }) => {
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'search' || searchExpanded) {
      searchInputRef.current?.focus();
    }
  }, [activeTab, searchExpanded]);

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-8 lg:px-12 min-h-16 py-3 flex flex-wrap items-center gap-3 sm:gap-6">
        
        {/* Brand Logo */}
        <button
          type="button"
          onClick={onHome}
          className="flex items-center gap-2 cursor-pointer group"
          aria-label="Go to FlimZio home"
        >
          <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-950/40 group-hover:bg-indigo-500 transition-colors">
            <Disc3 className="w-6 h-6 animate-[spin_9s_linear_infinite] group-hover:animate-[spin_2.5s_linear_infinite]" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
            FlimZio
          </span>
        </button>

        <nav className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-1 sm:gap-2 lg:gap-3">
          {activeTab === 'search' || searchExpanded ? (
            <form
              onSubmit={onSearch}
              className="relative min-w-0 flex-1 sm:flex-none sm:w-[min(48vw,32rem)] overflow-hidden transition-[width] duration-200 ease-out"
            >
              <Search className="absolute right-3 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-slate-300 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="search"
                aria-label="Search movies"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-10 sm:h-11 w-full rounded-lg border border-slate-700 bg-slate-800 pl-3 pr-10 text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </form>
          ) : (
            <button
              type="button"
              onClick={onOpenSearch}
              className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg px-2 sm:h-11 sm:gap-2 sm:px-5 lg:px-6 py-2 text-sm sm:text-base font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              aria-label="Open search"
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Search</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('explore')}
            className={`flex shrink-0 items-center gap-1.5 px-2 sm:gap-2 sm:px-5 lg:px-6 py-2.5 rounded-lg text-sm sm:text-base font-medium transition-colors ${
              activeTab === 'explore'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Explore</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`flex shrink-0 items-center gap-1.5 px-2 sm:gap-2 sm:px-5 lg:px-6 py-2.5 rounded-lg text-sm sm:text-base font-medium transition-colors relative ${
              activeTab === 'wishlist'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Wishlist</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;