import React from 'react';
import { Film, Bookmark, Search } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab, wishlistCount }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
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

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'trending'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Film className="w-4 h-4" />
            Trending
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
            <Bookmark className="w-4 h-4" />
            Wishlist
            {wishlistCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-indigo-500 text-white rounded-full">
                {wishlistCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;