import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Calendar, Clock, MapPin, AlertCircle, X, Download, Trash2, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { bookingAPI } from '../services/api';
import { formatCurrency, formatDate, formatTime } from '../utils/helpers';
import { PageLoader } from '../components/common/LoadingSpinner';

const DEFAULT_SAMPLE_BOOKINGS = [
  {
    _id: 'b_demo_1',
    bookingId: 'IMV9842F1',
    showtime: {
      movie: { title: 'Pushpa 2: The Rule' },
      theatre: { name: 'PVR Cinemas - Phoenix Mall', city: 'Mumbai' },
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      startTime: '17:30'
    },
    selectedSeats: [{ seatNumber: 'C4', row: 'C' }, { seatNumber: 'C5', row: 'C' }],
    finalAmount: 510,
    bookingStatus: 'confirmed'
  }
];

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState(DEFAULT_SAMPLE_BOOKINGS);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await bookingAPI.getMyBookings();
      if (data.success && data.bookings?.length > 0) {
        setBookings(data.bookings);
      }
    } catch (_) {}
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking? A refund will be initiated.')) {
      return;
    }
    setCancellingId(id);
    try {
      const { data } = await bookingAPI.cancel(id, 'User requested cancellation');
      if (data.success) {
        toast.success(data.message);
        fetchBookings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const now = new Date();
  const upcomingBookings = bookings.filter(b => {
    if (b.bookingStatus === 'cancelled') return false;
    const showDate = new Date(b.showtime?.date);
    return showDate >= now;
  });

  const previousBookings = bookings.filter(b => {
    if (b.bookingStatus === 'cancelled') return true;
    const showDate = new Date(b.showtime?.date);
    return showDate < now;
  });

  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : previousBookings;

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-4xl font-extrabold font-display text-white mb-3">
          My <span className="gradient-text">Movie Bookings</span>
        </h1>
        <p className="text-gray-400 max-w-2xl">
          View your confirmed e-tickets, review booking history, or cancel upcoming reservations.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2.5 sm:gap-3 mb-8 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
            activeTab === 'upcoming'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          Upcoming Shows ({upcomingBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
            activeTab === 'history'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          Booking History & Cancelled ({previousBookings.length})
        </button>
      </div>

      {/* Bookings List */}
      {displayedBookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {displayedBookings.map(b => (
            <div key={b._id} className="glass-card rounded-2xl p-4 sm:p-6 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">ID: {b.bookingId}</span>
                    <h3 className="text-xl font-bold font-display text-white mt-0.5">{b.showtime?.movie?.title}</h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
                      b.bookingStatus === 'confirmed'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {b.bookingStatus.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-gray-300 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>{b.showtime?.theatre?.name}, {b.showtime?.theatre?.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>{formatDate(b.showtime?.date)}</span>
                    <Clock className="w-4 h-4 text-purple-400 shrink-0 ml-2" />
                    <span>{formatTime(b.showtime?.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="font-mono text-purple-300 font-bold">
                      Seats: {b.selectedSeats?.map(s => s.seatNumber).join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 block">Total Paid</span>
                  <span className="text-lg font-bold text-white">{formatCurrency(b.finalAmount)}</span>
                </div>

                <div className="flex gap-2">
                  {b.bookingStatus === 'confirmed' && (
                    <>
                      <button
                        onClick={() => setSelectedTicket(b)}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Ticket className="w-3.5 h-3.5" /> View Ticket
                      </button>
                      <button
                        disabled={cancellingId === b._id}
                        onClick={() => handleCancelBooking(b._id)}
                        className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        title="Cancel Booking"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-16 text-center text-gray-400">
          <Ticket className="w-12 h-12 text-purple-400 mx-auto mb-3 opacity-50" />
          <p className="text-lg mb-2">No bookings in this category.</p>
          <p className="text-xs text-gray-500">Explore movies and book your cinema seats today!</p>
        </div>
      )}

      {/* Ticket QR Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTicket(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          >
            <div
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-md glass-card rounded-3xl p-5 sm:p-8 border border-purple-500/40 shadow-2xl text-center space-y-5 sm:space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedTicket(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-purple-400 font-bold">Official E-Ticket</span>
                <h3 className="text-2xl font-bold font-display text-white mt-1">{selectedTicket.showtime?.movie?.title}</h3>
                <p className="text-xs text-gray-400">{selectedTicket.showtime?.theatre?.name}</p>
              </div>

              <div className="bg-[#12121A] rounded-2xl p-4 border border-white/10 text-xs space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-400">Date:</span>
                  <span className="text-white font-medium">{formatDate(selectedTicket.showtime?.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time:</span>
                  <span className="text-white font-medium">{formatTime(selectedTicket.showtime?.startTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Seats:</span>
                  <span className="text-purple-300 font-mono font-bold">
                    {selectedTicket.selectedSeats?.map(s => s.seatNumber).join(', ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Paid:</span>
                  <span className="text-white font-bold">{formatCurrency(selectedTicket.finalAmount)}</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center">
                <div className="bg-white p-3 rounded-2xl shadow-xl">
                  <QRCodeSVG
                    value={JSON.stringify({
                      bookingId: selectedTicket.bookingId,
                      movie: selectedTicket.showtime?.movie?.title,
                      seats: selectedTicket.selectedSeats?.map(s => s.seatNumber)
                    })}
                    size={140}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2 font-mono">{selectedTicket.bookingId}</p>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full py-3 rounded-xl btn-primary text-white font-semibold text-sm flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download / Print Ticket
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
