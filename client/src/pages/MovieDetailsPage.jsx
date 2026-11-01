import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Clock, Calendar, Globe, Play, Ticket, ChevronRight, MapPin, X } from 'lucide-react';
import { movieAPI, showtimeAPI } from '../services/api';
import { formatDuration, formatDate, getRatingColor, getYouTubeEmbedUrl, formatTime } from '../utils/helpers';
import { INITIAL_MOVIES, INITIAL_THEATRES } from '../utils/movieData';

export default function MovieDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Instant preloaded fallback movie
  const fallbackMovie = INITIAL_MOVIES.find(m => m._id === id) || INITIAL_MOVIES[0];
  const [movie, setMovie] = useState(fallbackMovie);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [trailerModal, setTrailerModal] = useState(false);

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  useEffect(() => {
    if (movie?._id) {
      fetchLiveShowtimes();
    }
  }, [movie, selectedDate]);

  const fetchMovieDetails = async () => {
    try {
      const { data } = await movieAPI.getById(id);
      if (data.success && data.movie) {
        setMovie(data.movie);
      }
    } catch (_) {
      // Use fallbackMovie already in state
    }
  };

  const fetchLiveShowtimes = async () => {
    try {
      const { data } = await showtimeAPI.getAll({
        movieId: movie._id,
        date: selectedDate
      });
      if (data.success && data.showtimes?.length > 0) {
        setShowtimes(data.showtimes);
      } else {
        generateDefaultShowtimes();
      }
    } catch (_) {
      generateDefaultShowtimes();
    }
  };

  const generateDefaultShowtimes = () => {
    const slots = [];
    const times = ['10:30', '14:00', '17:30', '21:00'];
    INITIAL_THEATRES.forEach(theatre => {
      times.forEach((startTime, idx) => {
        slots.push({
          _id: `st_${theatre._id}_${idx}`,
          theatre,
          startTime,
          format: idx % 2 === 0 ? 'IMAX' : '2D',
          pricing: { Silver: 150, Gold: 250, Platinum: 400 }
        });
      });
    });
    setShowtimes(slots);
  };

  // Next 7 days
  const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      full: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' })
    };
  });

  // Group showtimes by theatre
  const groupedShowtimes = showtimes.reduce((acc, st) => {
    const theatreId = st.theatre?._id || 't1';
    if (!acc[theatreId]) {
      acc[theatreId] = {
        theatre: st.theatre || INITIAL_THEATRES[0],
        slots: []
      };
    }
    acc[theatreId].slots.push(st);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#0A0A0F] pb-24 text-white">
      {/* Backdrop Header */}
      <div className="relative h-[260px] sm:h-[380px] md:h-[460px] lg:h-[500px] w-full overflow-hidden pt-16">
        <img
          src={movie.backdrop || movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover object-top opacity-30 filter blur-xs"
          onError={e => { e.target.src = movie.poster; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/70 to-transparent" />
      </div>

      {/* Main Content Info Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-24 sm:-mt-36 md:-mt-48 lg:-mt-60 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 sm:gap-8 lg:gap-12 items-start">
          {/* Poster Card */}
          <div className="w-48 sm:w-56 md:w-64 lg:w-72 shrink-0 mx-auto md:mx-0">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group aspect-[2/3] bg-[#12121A]">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              {movie.trailerUrl && (
                <button
                  onClick={() => setTrailerModal(true)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white font-semibold text-sm"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/50">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                  Watch Trailer
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 space-y-2">
              <Link
                to={`/booking/${movie._id}`}
                className="w-full py-3.5 rounded-xl btn-primary text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30"
              >
                <Ticket className="w-5 h-5" /> Book Tickets
              </Link>
              {movie.trailerUrl && (
                <button
                  onClick={() => setTrailerModal(true)}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Play className="w-4 h-4 fill-white" /> Watch Trailer
                </button>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {movie.certificate || 'UA'}
              </span>
              {movie.format?.map(fmt => (
                <span key={fmt} className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {fmt}
                </span>
              ))}
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-display text-white tracking-tight">
              {movie.title}
            </h1>

            {/* Metrics */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 py-3 sm:py-4 border-y border-white/10 text-xs sm:text-sm text-gray-300">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className={`font-bold ${getRatingColor(movie.rating)}`}>{movie.rating?.toFixed(1)}</span>
                <span className="text-gray-400 text-[10px] sm:text-xs">/10 IMDb</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>{formatDuration(movie.duration)}</span>
              </div>
              <span className="hidden sm:inline text-gray-600">•</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>{formatDate(movie.releaseDate)}</span>
              </div>
              <span className="hidden sm:inline text-gray-600">•</span>
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                <span>{movie.language?.join(', ')}</span>
              </div>
            </div>

            {/* Synopsis */}
            <div>
              <h3 className="text-base font-bold text-white mb-2">Synopsis</h3>
              <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                {movie.description}
              </p>
            </div>

            {/* Metadata & Genres */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-1">Director</h4>
                <p className="text-white font-medium text-sm">{movie.director}</p>
              </div>
              <div>
                <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-1">Genres</h4>
                <div className="flex flex-wrap gap-1.5">
                  {movie.genre?.map(g => (
                    <span key={g} className="px-2.5 py-0.5 rounded-lg bg-white/5 text-gray-300 text-xs font-medium border border-white/5">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Cast List */}
            {movie.cast && movie.cast.length > 0 && (
              <div className="pt-2">
                <h3 className="text-base font-bold text-white mb-3">Top Cast</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {movie.cast.map((c, i) => (
                    <div key={i} className="glass rounded-xl p-3 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-xs shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-xs font-semibold truncate">{c.name}</p>
                        <p className="text-gray-400 text-[11px] truncate">{c.character || 'Cast'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Showtimes & Theatres Booking Section */}
        <div className="mt-16 pt-10 border-t border-white/10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold font-display text-white">Select Date & Theatres</h2>
            <p className="text-gray-400 text-xs sm:text-sm">Choose your preferred cinema and showtime</p>
          </div>

          {/* Date Picker Bar */}
          <div className="flex gap-3 overflow-x-auto pb-4 mb-8 scroll-container">
            {dates.map((d) => (
              <button
                key={d.full}
                onClick={() => setSelectedDate(d.full)}
                className={`flex flex-col items-center justify-center min-w-[70px] py-3 px-4 rounded-xl border transition-all ${
                  selectedDate === d.full
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/30 scale-105'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                <span className="text-[10px] uppercase font-medium">{d.dayName}</span>
                <span className="text-base font-bold my-0.5">{d.dayNumber}</span>
                <span className="text-[10px]">{d.month}</span>
              </button>
            ))}
          </div>

          {/* Theatres List */}
          <div className="space-y-4">
            {Object.values(groupedShowtimes).map(({ theatre, slots }) => (
              <div key={theatre._id} className="glass-card rounded-2xl p-4 sm:p-6 border border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5 mb-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>{theatre.name}</span>
                    </h3>
                    <p className="text-gray-400 text-xs mt-0.5">{theatre.address}, {theatre.city}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {theatre.facilities?.map(f => (
                      <span key={f} className="px-2 py-0.5 rounded text-[11px] bg-white/5 text-gray-300 border border-white/5">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Showtimes slots */}
                <div className="flex flex-wrap gap-2.5 sm:gap-3">
                  {slots.map(slot => (
                    <Link
                      key={slot._id}
                      to={`/booking/${movie._id}?showtimeId=${slot._id}`}
                      className="group flex flex-col items-center px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-purple-600 hover:border-purple-500 text-white transition-all text-center"
                    >
                      <span className="text-xs sm:text-sm font-bold group-hover:text-white">{formatTime(slot.startTime)}</span>
                      <span className="text-[10px] sm:text-[11px] text-purple-300 group-hover:text-purple-100 mt-0.5">
                        {slot.format} • ₹{slot.pricing?.Silver || 150}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      <AnimatePresence>
        {trailerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setTrailerModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setTrailerModal(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/70 text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <iframe
                src={`${getYouTubeEmbedUrl(movie.trailerUrl)}?autoplay=1`}
                className="w-full h-full"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
