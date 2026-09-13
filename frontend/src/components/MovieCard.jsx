import React, { useState } from 'react';
import { Heart } from 'lucide-react';

export default function MovieCard({ movie, isWishlisted, onToggleWishlist, onSelectMovie }) {
  const title = movie.title || movie.name || 'Untitled';
  const [imageFailed, setImageFailed] = useState(false);
  const posterPath = movie.posterUrl || (
    movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : 'https://via.placeholder.com/500x750?text=No+Image'
  );

  
  const releaseDate = movie.releaseDate || movie.release_date;
  const releaseYear = releaseDate ? releaseDate.split('-')[0] : '';

  return (
    <div 
      onClick={() => onSelectMovie && onSelectMovie(movie)}
      className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg hover:border-slate-700 transition-all cursor-pointer group flex flex-col h-full"
    >
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
        {imageFailed ? (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-5 text-center">
            <span className="font-serif text-xl font-bold leading-tight text-indigo-100 sm:text-2xl">{title}</span>
          </div>
        ) : (
          <img
            src={posterPath}
            alt={title}
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        )}
        
        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevents clicking the heart from opening the detail page
            onToggleWishlist(movie);
          }}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white backdrop-blur-sm transition-colors"
          aria-label="Toggle Wishlist"
        >
          <Heart 
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
              isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-200'
            }`} 
          />
        </button>
      </div>

      {/* Movie Info */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-slate-100 truncate group-hover:text-indigo-400 transition-colors">
            {title}
          </h3>
          {releaseYear && (
            <p className="text-xs text-slate-400 mt-1">{releaseYear}</p>
          )}
        </div>
      </div>
    </div>
  );
}