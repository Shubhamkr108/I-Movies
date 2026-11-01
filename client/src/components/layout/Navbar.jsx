import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, MapPin, ChevronDown, User, Ticket, LogOut, Settings, Menu, X, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad'];

export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [cityDropdown, setCityDropdown] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selectedCity, setSelectedCity] = useState(localStorage.getItem('imovies_city') || 'Mumbai');
  const [searchQuery, setSearchQuery] = useState('');

  const cityDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    setMobileMenu(false);
    setProfileDropdown(false);
    setCityDropdown(false);
  }, [location.pathname]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target)) {
        setCityDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    localStorage.setItem('imovies_city', city);
    setCityDropdown(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Movies', to: '/movies' },
    { label: 'Theatres', to: '/theatres' },
    { label: 'Offers', to: '/offers' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0F]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-18">
          {/* Logo & City Selector */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black font-display tracking-tight text-white">
                I<span className="gradient-text">Movies</span>
              </span>
            </Link>

            {/* City Selector */}
            <div className="relative hidden sm:block" ref={cityDropdownRef}>
              <button
                onClick={() => setCityDropdown(!cityDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 transition-colors cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>{selectedCity}</span>
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${cityDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {cityDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute left-0 top-full mt-2 w-44 glass-card rounded-2xl shadow-2xl py-2 z-50 border border-white/10"
                  >
                    <p className="px-3 py-1.5 text-[10px] uppercase font-bold text-gray-500 tracking-wider">Select Metro</p>
                    {CITIES.map(city => (
                      <button
                        key={city}
                        onClick={() => handleCitySelect(city)}
                        className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors ${
                          selectedCity === city
                            ? 'text-purple-400 bg-purple-500/10 font-bold'
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Search Bar (Center Desktop) */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative w-64 lg:w-80">
            <Search className="absolute left-3.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies, genres..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
            />
          </form>

          {/* Navigation Links & User Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    location.pathname === link.to
                      ? 'text-purple-400 bg-purple-500/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* User Dropdown or Login */}
            {isAuthenticated ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-600/15 border border-purple-500/30 hover:bg-purple-600/25 transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-[10px] font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-xs font-semibold text-white max-w-[90px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform hidden sm:block ${profileDropdown ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-full mt-2 w-52 glass-card rounded-2xl shadow-2xl p-2 z-50 border border-white/10 space-y-1 text-xs"
                    >
                      <div className="px-3 py-2 border-b border-white/10">
                        <p className="font-bold text-white truncate">{user?.name}</p>
                        <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                      </div>
                      <Link to="/my-bookings" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5">
                        <Ticket className="w-4 h-4 text-purple-400" /> My Bookings
                      </Link>
                      <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5">
                        <User className="w-4 h-4 text-purple-400" /> Account Profile
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-purple-300 hover:bg-purple-500/10 font-semibold">
                          <Settings className="w-4 h-4" /> Admin Console
                        </Link>
                      )}
                      <div className="border-t border-white/10 pt-1">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl btn-primary text-white text-xs font-bold shadow-md shadow-purple-900/30 hover:opacity-95"
                >
                  Join Free
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="lg:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5"
            >
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden pb-4 pt-2 border-t border-white/10 space-y-2 text-sm"
            >
              <form onSubmit={handleSearchSubmit} className="relative mb-3">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs"
                />
              </form>

              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 font-medium"
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-2 border-t border-white/10">
                <p className="px-3 text-[10px] uppercase font-bold text-gray-500 mb-1">City: {selectedCity}</p>
                <div className="flex flex-wrap gap-1 px-3">
                  {CITIES.slice(0, 5).map(c => (
                    <button
                      key={c}
                      onClick={() => handleCitySelect(c)}
                      className={`px-2.5 py-1 rounded-lg text-xs ${selectedCity === c ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
