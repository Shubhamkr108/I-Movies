import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Ticket, ChevronLeft, ChevronRight, Star, Clock, TrendingUp, Search, Filter, Bell, Tag, X } from 'lucide-react';
import { movieAPI, offerAPI } from '../services/api';
import MovieCard from '../components/common/MovieCard';
import { formatDuration, formatDate, getRatingColor, getYouTubeEmbedUrl, debounce } from '../utils/helpers';
import { INITIAL_MOVIES, INITIAL_OFFERS } from '../utils/movieData';

const GENRES = ['All', 'Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller', 'Sci-Fi', 'Crime'];

export default function HomePage() {
  const [heroMovies, setHeroMovies] = useState(INITIAL_MOVIES.slice(0, 5));
  const [nowShowing, setNowShowing] = useState(INITIAL_MOVIES);
  const [comingSoon, setComingSoon] = useState(INITIAL_MOVIES.filter(m => m.status === 'coming_soon'));
  const [trending, setTrending] = useState(INITIAL_MOVIES.slice(0, 8));
  const [offers, setOffers] = useState(INITIAL_OFFERS);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMovies, setFilteredMovies] = useState(INITIAL_MOVIES);
  const [trailerModal, setTrailerModal] = useState(null);
  const slideTimer = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [nowRes, comingRes, offersRes] = await Promise.allSettled([
        movieAPI.getAll({ status: 'now_showing', limit: 12 }),
        movieAPI.getAll({ status: 'coming_soon', limit: 6 }),
        offerAPI.getAll()
      ]);

      if (nowRes.status === 'fulfilled' && nowRes.value?.data?.movies?.length > 0) {
        const liveNow = nowRes.value.data.movies;
        setNowShowing(liveNow);
        setFilteredMovies(liveNow);
        setHeroMovies(liveNow.slice(0, 5));
        setTrending([...liveNow].sort((a, b) => b.rating - a.rating).slice(0, 8));
      }

      if (comingRes.status === 'fulfilled' && comingRes.value?.data?.movies?.length > 0) {
        setComingSoon(comingRes.value.data.movies);
      }

      if (offersRes.status === 'fulfilled' && offersRes.value?.data?.offers?.length > 0) {
        setOffers(offersRes.value.data.offers);
      }
    } catch (err) {
      console.log('Using preloaded cinema dataset');
    }
  };

  // Auto-slide hero banner
  useEffect(() => {
    if (!autoPlay || heroMovies.length < 2) return;
    slideTimer.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroMovies.length);
    }, 6000);
    return () => clearInterval(slideTimer.current);
  }, [autoPlay, heroMovies.length]);

  const goToSlide = (idx) => {
    clearInterval(slideTimer.current);
    setCurrentSlide(idx);
  };

  const prevSlide = () => goToSlide((currentSlide - 1 + heroMovies.length) % heroMovies.length);
  const nextSlide = () => goToSlide((currentSlide + 1) % heroMovies.length);

  // Filter movies
  useEffect(() => {
    let filtered = nowShowing;
    if (selectedGenre !== 'All') filtered = filtered.filter(m => m.genre?.includes(selectedGenre));
    if (searchQuery.trim()) {
      filtered = filtered.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    setFilteredMovies(filtered);
  }, [selectedGenre, searchQuery, nowShowing]);

  const handleSearch = debounce((q) => setSearchQuery(q), 250);
  const currentMovie = heroMovies[currentSlide] || INITIAL_MOVIES[0];

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Hero Section */}
      <section className="relative min-h-[640px] lg:h-[85vh] max-h-[850px] overflow-hidden pt-16 flex items-center">
        {/* Backdrop Banner */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 z-0"
          >
            <img
              src={currentMovie.backdrop || currentMovie.poster}
              alt={currentMovie.title}
              className="w-full h-full object-cover object-center brightness-40"
              onError={e => { e.target.src = currentMovie.poster; }}
            />
            {/* Gradients to blend smoothly with dark theme */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0F] via-[#0A0A0F]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-[#0A0A0F]/60" />
          </motion.div>
        </AnimatePresence>

        {/* Hero Content (Clean 2-Column Grid) */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Movie Info */}
            <div className="lg:col-span-8 space-y-5">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-purple-500/25 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-wider">
                  Featured Premiere
                </span>
                {currentMovie.format?.map(fmt => (
                  <span key={fmt} className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-white text-xs font-semibold">
                    {fmt}
                  </span>
                ))}
              </div>

              {/* Title */}
              <motion.h1
                key={`title-${currentSlide}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="text-3xl sm:text-5xl lg:text-7xl font-black font-display text-white leading-tight"
              >
                {currentMovie.title}
              </motion.h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs sm:text-sm text-gray-300">
                <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" />
                  <span className={`font-bold ${getRatingColor(currentMovie.rating)}`}>{currentMovie.rating?.toFixed(1)}</span>
                  <span className="text-gray-400 text-[10px] sm:text-xs">/10</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                  <span>{formatDuration(currentMovie.duration)}</span>
                </div>
                <span className="hidden sm:inline text-gray-600">•</span>
                <span className="px-2 py-0.5 rounded border border-gray-600 text-xs font-semibold">{currentMovie.certificate || 'UA'}</span>
                <span className="hidden sm:inline text-gray-600">•</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentMovie.genre?.slice(0, 3).map(g => (
                    <span key={g} className="px-2 py-0.5 rounded-md bg-purple-600/20 text-purple-300 text-xs font-medium">
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              {/* Synopsis */}
              <p className="text-gray-300 text-xs sm:text-base leading-relaxed max-w-2xl line-clamp-3">
                {currentMovie.description}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 pt-2">
                <Link
                  to={`/booking/${currentMovie._id}`}
                  className="px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl btn-primary text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-purple-600/30 hover:scale-105 transition-all"
                >
                  <Ticket className="w-4 h-4 sm:w-5 sm:h-5" /> Book Tickets
                </Link>
                {currentMovie.trailerUrl && (
                  <button
                    onClick={() => setTrailerModal(getYouTubeEmbedUrl(currentMovie.trailerUrl))}
                    className="px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 backdrop-blur-md transition-all hover:scale-105"
                  >
                    <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" /> Watch Trailer
                  </button>
                )}
                <Link
                  to={`/movies/${currentMovie._id}`}
                  className="px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-medium text-xs sm:text-sm transition-colors"
                >
                  Details
                </Link>
              </div>
            </div>

            {/* Right Column: 3D-Styled Movie Poster with Neon Glow */}
            <div className="hidden lg:flex lg:col-span-4 justify-center">
              <motion.div
                key={`poster-${currentSlide}`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative group w-64 xl:w-72"
              >
                <div className="absolute -inset-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-40 group-hover:opacity-70 transition-opacity" />
                <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl aspect-[2/3] bg-[#12121A]">
                  <img
                    src={currentMovie.poster}
                    alt={currentMovie.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                    <p className="text-white font-bold text-sm truncate">{currentMovie.title}</p>
                    <p className="text-purple-300 text-xs">{currentMovie.genre?.join(', ')}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Carousel Prev / Next Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full glass flex items-center justify-center text-white hover:bg-purple-600 hover:border-purple-500 transition-all shadow-lg"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full glass flex items-center justify-center text-white hover:bg-purple-600 hover:border-purple-500 transition-all shadow-lg"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroMovies.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-8 bg-purple-500' : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Trending Movies (Horizontal Scroll) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
            <div>
              <h2 className="text-2xl font-bold font-display text-white flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-400" />
                Trending Movies
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm">Top rated cinema blockbusters this week</p>
            </div>
          </div>
          <Link to="/movies" className="text-purple-400 hover:text-purple-300 text-sm font-semibold flex items-center gap-1">
            See All →
          </Link>
        </div>

        <div className="overflow-x-auto scroll-container -mx-4 px-4 pb-4">
          <div className="flex gap-5 w-max">
            {trending.map((movie, idx) => (
              <div key={movie._id} className="w-48 sm:w-56 shrink-0">
                <MovieCard movie={movie} index={idx} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Now Showing Section with Search & Category Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-green-500 to-emerald-500" />
            <div>
              <h2 className="text-2xl font-bold font-display text-white">Now Showing</h2>
              <p className="text-gray-400 text-xs sm:text-sm">Currently running in theatres near you</p>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 mb-8 border border-white/10 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search movie title..."
              onChange={e => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto w-full pb-1 scroll-container">
            {GENRES.map(genre => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedGenre === genre
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Movies Grid */}
        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5 lg:gap-6">
            {filteredMovies.map((movie, idx) => (
              <MovieCard key={movie._id} movie={movie} index={idx} />
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-12 text-center text-gray-400">
            <p className="text-base mb-2">No movies match your criteria</p>
            <button
              onClick={() => { setSelectedGenre('All'); setSearchQuery(''); }}
              className="mt-2 text-purple-400 hover:underline text-xs"
            >
              Reset filters
            </button>
          </div>
        )}
      </section>

      {/* Special Offers Section */}
      {offers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 border-t border-white/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-pink-500 to-red-500" />
            <div>
              <h2 className="text-2xl font-bold font-display text-white">Special Cinema Offers</h2>
              <p className="text-gray-400 text-xs sm:text-sm">Exclusive promo codes and bank discounts</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {offers.map((offer, idx) => (
              <div
                key={offer._id || idx}
                className="glass-card rounded-2xl p-4 sm:p-6 border border-white/10 relative overflow-hidden flex flex-col justify-between hover:border-pink-500/40 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                    <Tag className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                    {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold font-display text-white mb-2 group-hover:text-purple-300 transition-colors">
                    {offer.title}
                  </h3>
                  <p className="text-gray-400 text-xs mb-6 line-clamp-2">{offer.description}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-dashed border-purple-500/40 text-purple-300 font-mono font-bold text-xs tracking-wider">
                    {offer.couponCode}
                  </span>
                  <span className="text-[11px] text-gray-500">Min. ₹{offer.minOrderAmount}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trailer Modal */}
      <AnimatePresence>
        {trailerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setTrailerModal(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <div
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl"
            >
              <button
                onClick={() => setTrailerModal(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/70 text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <iframe
                src={`${trailerModal}?autoplay=1`}
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
