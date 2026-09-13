import React from 'react';
import { Film, Heart, Search, Compass } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab, searchQuery, setSearchQuery, onSearch }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-3 flex items-center gap-4">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('trending')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="bg-indigo-600 p-2 rounded-lg text-white group-hover:bg-indigo-500 transition-colors">
            <Film className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Flimzio
          </span>
        </div>

        {/* Search stays in the former Trending position and expands on activation. */}
        <form onSubmit={onSearch} className={`relative transition-all duration-300 ${activeTab === 'search' ? 'flex-1 max-w-xl' : 'w-11'}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            aria-label="Search movies"
            placeholder={activeTab === 'search' ? 'Search movies...' : ''}
            value={searchQuery}
            onFocus={() => setActiveTab('search')}
            onChange={(event) => setSearchQuery(event.target.value)}
            className={`h-10 w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all ${activeTab === 'search' ? 'opacity-100' : 'cursor-pointer text-transparent'}`}
          />
        </form>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'explore'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            Explore
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'search'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            Search
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
              activeTab === 'wishlist'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            Wishlist
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;