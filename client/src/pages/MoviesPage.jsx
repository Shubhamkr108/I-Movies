import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Star, Clock, Sparkles } from 'lucide-react';
import { movieAPI } from '../services/api';
import MovieCard from '../components/common/MovieCard';
import { INITIAL_MOVIES } from '../utils/movieData';

const GENRES = ['All', 'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'];
const LANGUAGES = ['All', 'Hindi', 'English', 'Telugu', 'Tamil', 'Kannada', 'Malayalam'];

export default function MoviesPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [movies, setMovies] = useState(INITIAL_MOVIES);
  const [search, setSearch] = useState(initialSearch);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('-releaseDate');

  useEffect(() => {
    fetchLiveMovies();
  }, [selectedStatus, sortBy]);

  const fetchLiveMovies = async () => {
    try {
      const params = { sort: sortBy };
      if (selectedStatus !== 'all') params.status = selectedStatus;
      const { data } = await movieAPI.getAll(params);
      if (data.success && data.movies?.length > 0) {
        setMovies(data.movies);
      }
    } catch (_) {
      // Gracefully fall back to preloaded cinema dataset
    }
  };

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = !search ||
      movie.title.toLowerCase().includes(search.toLowerCase()) ||
      movie.description?.toLowerCase().includes(search.toLowerCase()) ||
      movie.director?.toLowerCase().includes(search.toLowerCase());

    const matchesGenre = selectedGenre === 'All' || movie.genre?.includes(selectedGenre);
    const matchesLanguage = selectedLanguage === 'All' || movie.language?.includes(selectedLanguage);
    const matchesStatus = selectedStatus === 'all' || movie.status === selectedStatus;

    return matchesSearch && matchesGenre && matchesLanguage && matchesStatus;
  });

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display mb-2">
          Explore <span className="gradient-text">Movies</span>
        </h1>
        <p className="text-gray-400 text-sm max-w-xl">
          Discover current cinema blockbusters, regional hits, and upcoming releases.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 mb-8 border border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, director, or cast..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scroll-container w-full sm:w-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'now_showing', label: 'Now Showing' },
              { id: 'coming_soon', label: 'Coming Soon' }
            ].map(st => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedStatus === st.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-3 border-t border-white/5 text-xs">
          <span className="font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-purple-400" /> Genre:
          </span>
          <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full scroll-container">
            {GENRES.slice(0, 8).map(g => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedGenre === g ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-auto sm:ml-auto flex items-center gap-2 justify-between sm:justify-start">
            <span className="text-gray-400 text-xs">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
            >
              {LANGUAGES.map(l => (
                <option key={l} value={l} className="bg-[#12121A]">{l}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Movie Grid */}
      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5 lg:gap-6">
          {filteredMovies.map((movie, idx) => (
            <MovieCard key={movie._id} movie={movie} index={idx} />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl py-16 text-center text-gray-400">
          <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold text-white mb-1">No movies match your filter</h3>
          <p className="text-xs mb-4">Try clearing filters to see all available titles.</p>
          <button
            onClick={() => { setSearch(''); setSelectedGenre('All'); setSelectedLanguage('All'); setSelectedStatus('all'); }}
            className="px-4 py-2 rounded-xl btn-primary text-white text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
