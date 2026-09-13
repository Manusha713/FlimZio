import React from 'react';
import { Star, Bookmark, Trash2, Calendar } from 'lucide-react';

const MovieCard = ({ movie, isWishlisted, onToggleWishlist }) => {
  const { id, title, posterUrl, rating, releaseDate, overview } = movie;

  return (
    <div className="bg-slate-800/80 rounded-xl overflow-hidden border border-slate-700/50 hover:border-slate-600 transition-all duration-300 flex flex-col group">
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] bg-slate-900 overflow-hidden">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            No Image Available
          </div>
        )}

        {/* Rating Badge */}
        {rating > 0 && (
          <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-700 flex items-center gap-1.5 text-xs font-semibold text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            {rating}
          </div>
        )}

        {/* Wishlist Button Overlay */}
        <button
          onClick={() => onToggleWishlist(movie)}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            isWishlisted
              ? 'bg-rose-600 text-white hover:bg-rose-700'
              : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-900'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          {isWishlisted ? (
            <Trash2 className="w-4 h-4" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Movie Details */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-slate-100 text-lg line-clamp-1 mb-1" title={title}>
          {title}
        </h3>

        {releaseDate && (
          <div className="flex items-center gap-1 text-slate-400 text-xs mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>{releaseDate.substring(0, 4)}</span>
          </div>
        )}

        <p className="text-slate-400 text-xs line-clamp-3 mb-4 flex-grow">
          {overview || 'No description available for this movie.'}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;