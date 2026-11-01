import React, { useState, useEffect } from 'react';
import {
  Users, Film, Ticket, IndianRupee, TrendingUp, Plus,
  Trash2, ShieldCheck, CheckCircle2, XCircle, Search, Settings,
  MapPin, Calendar, Clock, Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI, movieAPI, theatreAPI, showtimeAPI, offerAPI } from '../services/api';
import { formatCurrency, formatDate, formatTime } from '../utils/helpers';
import { PageLoader } from '../components/common/LoadingSpinner';
import { INITIAL_MOVIES, INITIAL_THEATRES, INITIAL_OFFERS } from '../utils/movieData';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad'];

const DEFAULT_STATS = {
  totalRevenue: 148500,
  confirmedBookings: 342,
  totalUsers: 189,
  totalMovies: 12,
  popularMovies: [
    { title: 'Pushpa 2: The Rule', revenue: 64200, bookingCount: 140 },
    { title: 'Kalki 2898 AD', revenue: 48900, bookingCount: 112 },
    { title: 'Stree 2', revenue: 35400, bookingCount: 90 }
  ],
  recentBookings: [
    { _id: 'rb1', showtime: { movie: { title: 'Pushpa 2: The Rule' } }, user: { name: 'Rahul Sharma', email: 'rahul@gmail.com' }, finalAmount: 510, createdAt: new Date().toISOString() },
    { _id: 'rb2', showtime: { movie: { title: 'Kalki 2898 AD' } }, user: { name: 'Priya Verma', email: 'priya@gmail.com' }, finalAmount: 820, createdAt: new Date().toISOString() }
  ]
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Management data lists
  const [moviesList, setMoviesList] = useState(INITIAL_MOVIES);
  const [bookingsList, setBookingsList] = useState([
    { _id: 'b1', bookingId: 'IMV9842F1', user: { name: 'Rahul Sharma', email: 'rahul@gmail.com' }, showtime: { movie: { title: 'Pushpa 2: The Rule' }, theatre: { name: 'PVR Phoenix' } }, selectedSeats: [{ seatNumber: 'C4' }, { seatNumber: 'C5' }], finalAmount: 510, bookingStatus: 'confirmed' }
  ]);
  const [usersList, setUsersList] = useState([
    { _id: 'u1', name: 'Demo User', email: 'user@imovies.com', city: 'Delhi', role: 'user', isActive: true },
    { _id: 'u2', name: 'Admin', email: 'admin@imovies.com', city: 'Mumbai', role: 'admin', isActive: true }
  ]);
  const [theatresList, setTheatresList] = useState(INITIAL_THEATRES);
  const [showtimesList, setShowtimesList] = useState([
    { _id: 'st1', movie: INITIAL_MOVIES[0], theatre: INITIAL_THEATRES[0], date: new Date().toISOString(), startTime: '18:30', format: 'IMAX', pricing: { Silver: 150, Gold: 250, Platinum: 400 } }
  ]);
  const [offersList, setOffersList] = useState(INITIAL_OFFERS);

  // Modals
  const [showAddMovieModal, setShowAddMovieModal] = useState(false);
  const [showAddTheatreModal, setShowAddTheatreModal] = useState(false);
  const [showAddShowtimeModal, setShowAddShowtimeModal] = useState(false);
  const [showAddOfferModal, setShowAddOfferModal] = useState(false);

  // Form states
  const [newMovie, setNewMovie] = useState({
    title: '', description: '', poster: '', duration: 150,
    genre: 'Action, Thriller', language: 'Hindi, English', director: '',
    rating: 8.0, releaseDate: new Date().toISOString().split('T')[0],
    trailerUrl: '', status: 'now_showing', certificate: 'UA'
  });

  const [newTheatre, setNewTheatre] = useState({
    name: '', city: 'Mumbai', address: '', totalScreens: 6,
    facilities: ['Parking', 'Air Conditioned', 'Dolby Atmos', 'Online Booking']
  });

  const [newShowtime, setNewShowtime] = useState({
    movie: '', theatre: '', date: new Date().toISOString().split('T')[0],
    startTime: '18:30', format: '2D', language: 'Hindi',
    pricing: { Silver: 150, Gold: 250, Platinum: 400 }
  });

  const [newOffer, setNewOffer] = useState({
    title: '', description: '', couponCode: '', discountType: 'percentage',
    discountValue: 20, maxDiscount: 150, minOrderAmount: 300,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, moviesRes, bookingsRes, usersRes, theatresRes, showtimesRes, offersRes] = await Promise.all([
        adminAPI.getDashboard(),
        movieAPI.getAll({ limit: 100 }),
        adminAPI.getBookings({ limit: 50 }),
        adminAPI.getUsers({ limit: 50 }),
        theatreAPI.getAll(),
        showtimeAPI.getAll({ limit: 50 }),
        offerAPI.getAll()
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.stats);
      if (moviesRes.data?.success) setMoviesList(moviesRes.data.movies);
      if (bookingsRes.data?.success) setBookingsList(bookingsRes.data.bookings);
      if (usersRes.data?.success) setUsersList(usersRes.data.users);
      if (theatresRes.data?.success) setTheatresList(theatresRes.data.theatres);
      if (showtimesRes.data?.success) setShowtimesList(showtimesRes.data.showtimes);
      if (offersRes.data?.success) setOffersList(offersRes.data.offers);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
      toast.error('Failed to load full admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Movie Handlers
  const handleAddMovie = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newMovie,
        duration: Number(newMovie.duration),
        rating: Number(newMovie.rating),
        genre: newMovie.genre.split(',').map(s => s.trim()),
        language: newMovie.language.split(',').map(s => s.trim())
      };
      const { data } = await movieAPI.create(payload);
      if (data.success) {
        toast.success('Movie created successfully!');
        setShowAddMovieModal(false);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add movie');
    }
  };

  const handleDeleteMovie = async (id) => {
    if (!window.confirm('Delete this movie?')) return;
    try {
      const { data } = await movieAPI.delete(id);
      if (data.success) {
        toast.success('Movie deleted');
        setMoviesList(prev => prev.filter(m => m._id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete movie');
    }
  };

  // Theatre Handlers
  const handleAddTheatre = async (e) => {
    e.preventDefault();
    try {
      const { data } = await theatreAPI.create(newTheatre);
      if (data.success) {
        toast.success('Theatre added successfully!');
        setShowAddTheatreModal(false);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add theatre');
    }
  };

  const handleDeleteTheatre = async (id) => {
    if (!window.confirm('Delete this theatre?')) return;
    try {
      const { data } = await theatreAPI.delete(id);
      if (data.success) {
        toast.success('Theatre removed');
        setTheatresList(prev => prev.filter(t => t._id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete theatre');
    }
  };

  // Showtime Handlers
  const handleAddShowtime = async (e) => {
    e.preventDefault();
    if (!newShowtime.movie || !newShowtime.theatre) {
      toast.error('Please select both a movie and a theatre');
      return;
    }
    try {
      const { data } = await showtimeAPI.create(newShowtime);
      if (data.success) {
        toast.success('Showtime created successfully with seat layout!');
        setShowAddShowtimeModal(false);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create showtime');
    }
  };

  const handleDeleteShowtime = async (id) => {
    if (!window.confirm('Delete this showtime?')) return;
    try {
      const { data } = await showtimeAPI.delete(id);
      if (data.success) {
        toast.success('Showtime deleted');
        setShowtimesList(prev => prev.filter(s => s._id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete showtime');
    }
  };

  // Offer Handlers
  const handleAddOffer = async (e) => {
    e.preventDefault();
    try {
      const { data } = await offerAPI.create({
        ...newOffer,
        discountValue: Number(newOffer.discountValue),
        minOrderAmount: Number(newOffer.minOrderAmount),
        maxDiscount: Number(newOffer.maxDiscount)
      });
      if (data.success) {
        toast.success('Offer created successfully!');
        setShowAddOfferModal(false);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create offer');
    }
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm('Delete this offer?')) return;
    try {
      const { data } = await offerAPI.delete(id);
      if (data.success) {
        toast.success('Offer deleted');
        setOffersList(prev => prev.filter(o => o._id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete offer');
    }
  };

  // User Handlers
  const handleToggleUser = async (id) => {
    try {
      const { data } = await adminAPI.toggleUser(id);
      if (data.success) {
        toast.success(data.message);
        setUsersList(prev => prev.map(u => u._id === id ? { ...u, isActive: !u.isActive } : u));
      }
    } catch (err) {
      toast.error('Action failed');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold font-display text-white">
            Admin <span className="gradient-text">Control Center</span>
          </h1>
          <p className="text-gray-400 text-sm">System oversight, catalog operations, and revenue insights.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAddMovieModal(true)}
            className="px-4 py-2.5 rounded-xl btn-primary text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-purple-600/30"
          >
            <Plus className="w-4 h-4" /> Add Movie
          </button>
          <button
            onClick={() => setShowAddTheatreModal(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Theatre
          </button>
          <button
            onClick={() => setShowAddShowtimeModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Showtime
          </button>
          <button
            onClick={() => setShowAddOfferModal(true)}
            className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Coupon
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {[
          { label: 'Total Revenue', value: formatCurrency(stats?.totalRevenue || 0), icon: IndianRupee, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Confirmed Bookings', value: stats?.confirmedBookings || 0, icon: Ticket, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Registered Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Live Movies', value: stats?.totalMovies || 0, icon: Film, color: 'text-pink-400', bg: 'bg-pink-500/10' },
        ].map((item, i) => (
          <div key={i} className="glass-card rounded-2xl p-5 border border-white/10 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}>
              <item.icon className={`w-6 h-6 ${item.color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{item.label}</p>
              <h3 className="text-xl font-bold font-display text-white mt-0.5">{item.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4 mb-6 overflow-x-auto scroll-container">
        {[
          { id: 'overview', label: 'Dashboard Overview' },
          { id: 'movies', label: `Movies (${moviesList.length})` },
          { id: 'theatres', label: `Theatres (${theatresList.length})` },
          { id: 'showtimes', label: `Showtimes (${showtimesList.length})` },
          { id: 'offers', label: `Offers (${offersList.length})` },
          { id: 'bookings', label: `Bookings (${bookingsList.length})` },
          { id: 'users', label: `Users (${usersList.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold font-display text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" /> Top Performing Movies
            </h3>
            <div className="space-y-4">
              {stats?.popularMovies?.length > 0 ? (
                stats.popularMovies.map((pm, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center font-bold text-gray-500 text-sm">#{idx + 1}</span>
                      <p className="text-white font-medium text-sm truncate max-w-[200px]">{pm.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-purple-300 font-bold text-sm">{formatCurrency(pm.revenue)}</p>
                      <p className="text-[11px] text-gray-500">{pm.bookingCount} bookings</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No sales data recorded yet.</p>
              )}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold font-display text-white mb-4 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-purple-400" /> Recent Bookings
            </h3>
            <div className="space-y-3">
              {stats?.recentBookings?.length > 0 ? (
                stats.recentBookings.map((b) => (
                  <div key={b._id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 text-xs">
                    <div>
                      <p className="text-white font-semibold">{b.showtime?.movie?.title}</p>
                      <p className="text-gray-400 text-[11px]">{b.user?.name} ({b.user?.email})</p>
                    </div>
                    <div className="text-right">
                      <span className="text-green-400 font-bold block">{formatCurrency(b.finalAmount)}</span>
                      <span className="text-[10px] text-gray-500">{formatDate(b.createdAt)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No recent bookings found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: MOVIES */}
      {activeTab === 'movies' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300 min-w-[620px]">
              <thead className="bg-white/5 text-xs uppercase text-gray-400 border-b border-white/10">
                <tr>
                  <th className="p-4">Movie</th>
                  <th className="p-4">Director</th>
                  <th className="p-4">Genre</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {moviesList.map(movie => (
                  <tr key={movie._id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img src={movie.poster} alt={movie.title} className="w-10 h-14 object-cover rounded-lg" />
                      <div>
                        <p className="text-white font-semibold">{movie.title}</p>
                        <p className="text-xs text-gray-500">{movie.duration} mins • {movie.certificate}</p>
                      </div>
                    </td>
                    <td className="p-4 text-xs">{movie.director}</td>
                    <td className="p-4 text-xs">{movie.genre?.join(', ')}</td>
                    <td className="p-4 text-xs font-bold text-yellow-400">★ {movie.rating}</td>
                    <td className="p-4 text-xs">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                        movie.status === 'now_showing' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {movie.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteMovie(movie._id)}
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        title="Delete Movie"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: THEATRES */}
      {activeTab === 'theatres' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300 min-w-[620px]">
              <thead className="bg-white/5 uppercase text-gray-400 border-b border-white/10">
                <tr>
                  <th className="p-4">Theatre Name</th>
                  <th className="p-4">City</th>
                  <th className="p-4">Address</th>
                  <th className="p-4">Screens</th>
                  <th className="p-4">Facilities</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {theatresList.map(t => (
                  <tr key={t._id} className="hover:bg-white/5">
                    <td className="p-4 font-semibold text-white">{t.name}</td>
                    <td className="p-4 text-purple-300">{t.city}</td>
                    <td className="p-4 max-w-xs truncate">{t.address}</td>
                    <td className="p-4">{t.totalScreens || 6}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {t.facilities?.slice(0, 3).map(f => (
                          <span key={f} className="px-1.5 py-0.5 rounded bg-white/5 text-[10px]">{f}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteTheatre(t._id)}
                        className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        title="Delete Theatre"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: SHOWTIMES */}
      {activeTab === 'showtimes' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300 min-w-[640px]">
              <thead className="bg-white/5 uppercase text-gray-400 border-b border-white/10">
                <tr>
                  <th className="p-4">Movie</th>
                  <th className="p-4">Theatre</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Time</th>
                  <th className="p-4">Format</th>
                  <th className="p-4">Pricing</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {showtimesList.map(st => (
                  <tr key={st._id} className="hover:bg-white/5">
                    <td className="p-4 font-semibold text-white">{st.movie?.title}</td>
                    <td className="p-4">{st.theatre?.name} ({st.theatre?.city})</td>
                    <td className="p-4">{formatDate(st.date)}</td>
                    <td className="p-4 font-bold text-purple-300">{formatTime(st.startTime)}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px]">
                        {st.format}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[11px]">
                      S:₹{st.pricing?.Silver} | G:₹{st.pricing?.Gold} | P:₹{st.pricing?.Platinum}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteShowtime(st._id)}
                        className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        title="Delete Showtime"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: OFFERS */}
      {activeTab === 'offers' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300 min-w-[580px]">
              <thead className="bg-white/5 uppercase text-gray-400 border-b border-white/10">
                <tr>
                  <th className="p-4">Coupon Code</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Min Order</th>
                  <th className="p-4">Expiry</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {offersList.map(offer => (
                  <tr key={offer._id} className="hover:bg-white/5">
                    <td className="p-4 font-mono font-bold text-pink-400">{offer.couponCode}</td>
                    <td className="p-4 text-white font-medium">{offer.title}</td>
                    <td className="p-4 font-semibold text-green-400">
                      {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `₹${offer.discountValue}`}
                    </td>
                    <td className="p-4">₹{offer.minOrderAmount}</td>
                    <td className="p-4">{formatDate(offer.expiryDate)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteOffer(offer._id)}
                        className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        title="Delete Offer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300 min-w-[620px]">
              <thead className="bg-white/5 uppercase text-gray-400 border-b border-white/10">
                <tr>
                  <th className="p-4">Booking ID</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Movie & Theatre</th>
                  <th className="p-4">Seats</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookingsList.map(b => (
                  <tr key={b._id} className="hover:bg-white/5">
                    <td className="p-4 font-mono font-bold text-purple-300">{b.bookingId}</td>
                    <td className="p-4">
                      <p className="text-white font-medium">{b.user?.name}</p>
                      <p className="text-[10px] text-gray-500">{b.user?.email}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-white">{b.showtime?.movie?.title}</p>
                      <p className="text-[10px] text-gray-500">{b.showtime?.theatre?.name}</p>
                    </td>
                    <td className="p-4 font-mono text-purple-400">
                      {b.selectedSeats?.map(s => s.seatNumber).join(', ')}
                    </td>
                    <td className="p-4 font-bold text-white">{formatCurrency(b.finalAmount)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        b.bookingStatus === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: USERS */}
      {activeTab === 'users' && (
        <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300 min-w-[580px]">
              <thead className="bg-white/5 uppercase text-gray-400 border-b border-white/10">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">City</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {usersList.map(u => (
                  <tr key={u._id} className="hover:bg-white/5">
                    <td className="p-4 font-semibold text-white">{u.name}</td>
                    <td className="p-4 text-gray-400">{u.email}</td>
                    <td className="p-4">{u.city || 'Mumbai'}</td>
                    <td className="p-4 uppercase font-bold text-[10px]">{u.role}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        u.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleUser(u._id)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                          u.isActive ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30' : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD MOVIE */}
      {showAddMovieModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg glass-card rounded-2xl p-4 sm:p-6 border border-purple-500/30 my-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold font-display text-white mb-4">Add New Movie</h3>
            <form onSubmit={handleAddMovie} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Movie Title</label>
                <input
                  type="text"
                  value={newMovie.title}
                  onChange={e => setNewMovie({ ...newMovie, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Description</label>
                <textarea
                  value={newMovie.description}
                  onChange={e => setNewMovie({ ...newMovie, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Poster Image URL</label>
                  <input
                    type="url"
                    value={newMovie.poster}
                    onChange={e => setNewMovie({ ...newMovie, poster: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Director</label>
                  <input
                    type="text"
                    value={newMovie.director}
                    onChange={e => setNewMovie({ ...newMovie, director: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    value={newMovie.duration}
                    onChange={e => setNewMovie({ ...newMovie, duration: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Rating (1-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMovie.rating}
                    onChange={e => setNewMovie({ ...newMovie, rating: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Status</label>
                  <select
                    value={newMovie.status}
                    onChange={e => setNewMovie({ ...newMovie, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#12121A] border border-white/10 text-white"
                  >
                    <option value="now_showing">Now Showing</option>
                    <option value="coming_soon">Coming Soon</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Genres (comma separated)</label>
                <input
                  type="text"
                  value={newMovie.genre}
                  onChange={e => setNewMovie({ ...newMovie, genre: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">YouTube Trailer URL</label>
                <input
                  type="text"
                  value={newMovie.trailerUrl}
                  onChange={e => setNewMovie({ ...newMovie, trailerUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddMovieModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-white/10 text-white font-medium hover:bg-white/15"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg btn-primary text-white font-medium"
                >
                  Add Movie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD THEATRE */}
      {showAddTheatreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-md glass-card rounded-2xl p-4 sm:p-6 border border-blue-500/30 my-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold font-display text-white mb-4">Add Partner Theatre</h3>
            <form onSubmit={handleAddTheatre} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Theatre Name</label>
                <input
                  type="text"
                  value={newTheatre.name}
                  onChange={e => setNewTheatre({ ...newTheatre, name: e.target.value })}
                  placeholder="e.g. PVR ICON - Infiniti Mall"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">City</label>
                  <select
                    value={newTheatre.city}
                    onChange={e => setNewTheatre({ ...newTheatre, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#12121A] border border-white/10 text-white"
                  >
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Total Screens</label>
                  <input
                    type="number"
                    value={newTheatre.totalScreens}
                    onChange={e => setNewTheatre({ ...newTheatre, totalScreens: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Address</label>
                <textarea
                  value={newTheatre.address}
                  onChange={e => setNewTheatre({ ...newTheatre, address: e.target.value })}
                  placeholder="Full address of cinema..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  required
                />
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddTheatreModal(false)}
                  className="flex-1 py-2 rounded-lg bg-white/10 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Save Theatre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE SHOWTIME */}
      {showAddShowtimeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-md glass-card rounded-2xl p-4 sm:p-6 border border-emerald-500/30 my-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold font-display text-white mb-4">Create New Showtime</h3>
            <form onSubmit={handleAddShowtime} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Select Movie</label>
                <select
                  value={newShowtime.movie}
                  onChange={e => setNewShowtime({ ...newShowtime, movie: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#12121A] border border-white/10 text-white"
                  required
                >
                  <option value="">-- Choose Movie --</option>
                  {moviesList.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Select Theatre</label>
                <select
                  value={newShowtime.theatre}
                  onChange={e => setNewShowtime({ ...newShowtime, theatre: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#12121A] border border-white/10 text-white"
                  required
                >
                  <option value="">-- Choose Theatre --</option>
                  {theatresList.map(t => <option key={t._id} value={t._id}>{t.name} ({t.city})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={newShowtime.date}
                    onChange={e => setNewShowtime({ ...newShowtime, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Start Time (HH:MM)</label>
                  <input
                    type="time"
                    value={newShowtime.startTime}
                    onChange={e => setNewShowtime({ ...newShowtime, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Format</label>
                  <select
                    value={newShowtime.format}
                    onChange={e => setNewShowtime({ ...newShowtime, format: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#12121A] border border-white/10 text-white"
                  >
                    {['2D', '3D', 'IMAX', '4DX'].map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Language</label>
                  <input
                    type="text"
                    value={newShowtime.language}
                    onChange={e => setNewShowtime({ ...newShowtime, language: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-400 mb-1">Silver (₹)</label>
                  <input
                    type="number"
                    value={newShowtime.pricing.Silver}
                    onChange={e => setNewShowtime({
                      ...newShowtime,
                      pricing: { ...newShowtime.pricing, Silver: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Gold (₹)</label>
                  <input
                    type="number"
                    value={newShowtime.pricing.Gold}
                    onChange={e => setNewShowtime({
                      ...newShowtime,
                      pricing: { ...newShowtime.pricing, Gold: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Platinum (₹)</label>
                  <input
                    type="number"
                    value={newShowtime.pricing.Platinum}
                    onChange={e => setNewShowtime({
                      ...newShowtime,
                      pricing: { ...newShowtime.pricing, Platinum: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddShowtimeModal(false)}
                  className="flex-1 py-2 rounded-lg bg-white/10 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                >
                  Generate Showtime
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PROMO OFFER */}
      {showAddOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-md glass-card rounded-2xl p-4 sm:p-6 border border-pink-500/30 my-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold font-display text-white mb-4">Create Promo Offer</h3>
            <form onSubmit={handleAddOffer} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Offer Title</label>
                <input
                  type="text"
                  value={newOffer.title}
                  onChange={e => setNewOffer({ ...newOffer, title: e.target.value })}
                  placeholder="e.g. Festival Special Discount"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    value={newOffer.couponCode}
                    onChange={e => setNewOffer({ ...newOffer, couponCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. FESTIVAL50"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Discount Type</label>
                  <select
                    value={newOffer.discountType}
                    onChange={e => setNewOffer({ ...newOffer, discountType: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#12121A] border border-white/10 text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-400 mb-1">Value</label>
                  <input
                    type="number"
                    value={newOffer.discountValue}
                    onChange={e => setNewOffer({ ...newOffer, discountValue: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Max Disc (₹)</label>
                  <input
                    type="number"
                    value={newOffer.maxDiscount}
                    onChange={e => setNewOffer({ ...newOffer, maxDiscount: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={newOffer.minOrderAmount}
                    onChange={e => setNewOffer({ ...newOffer, minOrderAmount: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Description</label>
                <textarea
                  value={newOffer.description}
                  onChange={e => setNewOffer({ ...newOffer, description: e.target.value })}
                  placeholder="Terms of the offer..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={newOffer.expiryDate}
                  onChange={e => setNewOffer({ ...newOffer, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  required
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddOfferModal(false)}
                  className="flex-1 py-2 rounded-lg bg-white/10 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-medium"
                >
                  Create Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
