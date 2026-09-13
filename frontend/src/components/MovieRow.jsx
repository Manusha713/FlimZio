import React from 'react';
import MovieCard from './MovieCard';
import { ArrowRight } from 'lucide-react';

export default function MovieRow({ title, movies, wishlist, onToggleWishlist, onShowAll, onSelectMovie }) {
  if (!movies || movies.length === 0) return null;

  // Take only the first 15 movies for the row
  const displayMovies = movies.slice(0, 15);

  return (
    <div className="mb-10">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {/* Render View All button only if onShowAll handler exists */}
        {onShowAll && (
          <button onClick={onShowAll} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
            View All
          </button>
        )}
      </div>
      
      {/* Scrollable Container */}
      <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
        {displayMovies.map((movie) => (
          <div key={movie.id} className="min-w-[220px] max-w-[220px] snap-start flex-shrink-0">
            <MovieCard
              movie={movie}
              isWishlisted={wishlist.some((item) => item.movieId === movie.id)}
              onToggleWishlist={onToggleWishlist}
              onSelectMovie={onSelectMovie}
            />
          </div>
        ))}
        
        {/* Render the "Show All" Card at the end only if onShowAll is provided */}
        {onShowAll && (
          <div 
            onClick={onShowAll}
            className="min-w-[220px] max-w-[220px] snap-start flex-shrink-0 flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors group"
          >
            <div className="bg-indigo-600/20 p-4 rounded-full mb-3 group-hover:bg-indigo-600/40 transition-colors">
              <ArrowRight className="w-8 h-8 text-indigo-400 group-hover:text-indigo-300" />
            </div>
            <span className="font-semibold text-slate-300 group-hover:text-white">Show All {title}</span>
          </div>
        )}
      </div>
    </div>
  );
}
