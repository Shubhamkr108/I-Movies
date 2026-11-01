import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Ticket } from 'lucide-react';
import { formatDuration, getRatingColor } from '../../utils/helpers';

export default function MovieCard({ movie }) {
  return (
    <div className="group relative rounded-2xl overflow-hidden bg-[#12121A] border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-purple-900/30 flex flex-col justify-between">
      {/* Clickable Poster Container */}
      <Link to={`/movies/${movie._id}`} className="block relative aspect-[2/3] overflow-hidden bg-black/40">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={e => {
            e.target.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop';
          }}
        />

        {/* Rating Badge */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10">
          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <span className={`text-xs font-bold ${getRatingColor(movie.rating)}`}>
            {movie.rating?.toFixed(1)}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
            movie.status === 'now_showing'
              ? 'bg-green-500/80 text-white'
              : 'bg-purple-600/80 text-white'
          }`}>
            {movie.status === 'now_showing' ? 'In Theatres' : 'Coming Soon'}
          </span>
        </div>

        {/* Bottom Format Overlays on Poster */}
        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-[#12121A] via-[#12121A]/80 to-transparent flex items-center justify-between text-[11px] text-gray-300">
          <span className="font-semibold text-white">{movie.certificate || 'UA'}</span>
          <span className="truncate max-w-[120px]">{movie.language?.join(', ')}</span>
        </div>
      </Link>

      {/* Card Info & Action */}
      <div className="p-3.5 flex flex-col justify-between flex-1 space-y-3">
        <div>
          <Link to={`/movies/${movie._id}`}>
            <h3 className="font-bold text-white text-sm hover:text-purple-300 transition-colors line-clamp-1">
              {movie.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
            <span className="truncate max-w-[130px]">{movie.genre?.slice(0, 2).join(' • ')}</span>
            <span>•</span>
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3 text-purple-400" />
              {formatDuration(movie.duration)}
            </span>
          </div>
        </div>

        {/* Book Now Button */}
        {movie.status === 'now_showing' ? (
          <Link
            to={`/booking/${movie._id}`}
            className="w-full py-2.5 rounded-xl btn-primary text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-900/30 hover:opacity-95 transition-opacity"
          >
            <Ticket className="w-3.5 h-3.5" /> Book Tickets
          </Link>
        ) : (
          <Link
            to={`/movies/${movie._id}`}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  );
}
