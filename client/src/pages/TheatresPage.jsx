import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Film, Search, Sparkles } from 'lucide-react';
import { theatreAPI } from '../services/api';
import { INITIAL_THEATRES } from '../utils/movieData';

const CITIES = ['All', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad'];

export default function TheatresPage() {
  const [theatres, setTheatres] = useState(INITIAL_THEATRES);
  const [selectedCity, setSelectedCity] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLiveTheatres();
  }, [selectedCity]);

  const fetchLiveTheatres = async () => {
    try {
      const params = {};
      if (selectedCity !== 'All') params.city = selectedCity;
      const { data } = await theatreAPI.getAll(params);
      if (data.success && data.theatres?.length > 0) {
        setTheatres(data.theatres);
      }
    } catch (_) {
      // Keep preloaded theatres
    }
  };

  const filteredTheatres = theatres.filter(t => {
    const matchesCity = selectedCity === 'All' || t.city.toLowerCase() === selectedCity.toLowerCase();
    const matchesSearch = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.address.toLowerCase().includes(search.toLowerCase());
    return matchesCity && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 max-w-7xl mx-auto text-white">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display mb-2">
          Partner <span className="gradient-text">Theatres & Cinemas</span>
        </h1>
        <p className="text-gray-400 text-sm max-w-xl">
          Browse luxury cinema multiplexes equipped with IMAX, 4DX, and Dolby Atmos screens.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 mb-8 border border-white/10 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search theatre name, mall, or location..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 scroll-container">
          {CITIES.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCity(c)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCity === c
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Theatres Grid */}
      {filteredTheatres.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredTheatres.map(theatre => (
            <div
              key={theatre._id}
              className="glass-card rounded-2xl p-4 sm:p-6 border border-white/10 flex flex-col justify-between hover:border-purple-500/30 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-lg font-bold font-display text-white group-hover:text-purple-300 transition-colors">
                    {theatre.name}
                  </h3>
                  <span className="px-2.5 py-1 rounded-md bg-purple-500/15 text-purple-300 text-xs font-semibold shrink-0">
                    {theatre.city}
                  </span>
                </div>

                <div className="flex items-start gap-2 text-xs text-gray-400 mb-4">
                  <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{theatre.address}</p>
                </div>

                {theatre.facilities && (
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {theatre.facilities.map(f => (
                      <span key={f} className="px-2 py-0.5 rounded text-[11px] bg-white/5 text-gray-300 border border-white/5">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {theatre.totalScreens || 6} Screens
                </span>
                <Link
                  to={`/movies?city=${theatre.city}`}
                  className="px-4 py-2 rounded-xl btn-primary text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Film className="w-3.5 h-3.5" /> View Showtimes
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center text-gray-400">
          <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3 opacity-50" />
          <p className="text-base mb-1">No theatres found</p>
          <p className="text-xs">Try selecting another city or clearing your search.</p>
        </div>
      )}
    </div>
  );
}
