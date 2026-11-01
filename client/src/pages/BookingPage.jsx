import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Film, MapPin, Calendar, Clock, CheckCircle2, ChevronRight,
  CreditCard, Tag, Ticket, Download, ArrowLeft, ShieldCheck, Check
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { movieAPI, theatreAPI, showtimeAPI, bookingAPI, offerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, formatTime } from '../utils/helpers';
import { INITIAL_MOVIES, INITIAL_THEATRES, INITIAL_OFFERS, generateSeatGrid } from '../utils/movieData';

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad'];

export default function BookingPage() {
  const { movieId } = useParams();
  const [searchParams] = useSearchParams();
  const preSelectedShowtime = searchParams.get('showtimeId');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Booking Flow Steps: 1 = Choose Theatre & Time, 2 = Select Seats, 3 = Checkout, 4 = Ticket
  const [step, setStep] = useState(1);

  // Selections
  const [selectedCity, setSelectedCity] = useState(localStorage.getItem('imovies_city') || 'Mumbai');
  const [moviesList, setMoviesList] = useState(INITIAL_MOVIES);
  const targetMovie = INITIAL_MOVIES.find(m => m._id === movieId) || INITIAL_MOVIES[0];
  const [selectedMovie, setSelectedMovie] = useState(targetMovie);

  const [theatresList, setTheatresList] = useState(INITIAL_THEATRES);

  // 7-day date calendar
  const defaultDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      full: d.toISOString().split('T')[0],
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' })
    };
  });
  const [availableDates] = useState(defaultDates);
  const [selectedDate, setSelectedDate] = useState(defaultDates[0].full);

  // Selected showtime details
  const [selectedTheatre, setSelectedTheatre] = useState(INITIAL_THEATRES[0]);
  const [selectedShowtime, setSelectedShowtime] = useState(null);

  // Seat matrix
  const [seatMatrix, setSeatMatrix] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const MAX_SEATS = 8;

  // Coupon and Payment
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('demo');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Initial load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    initData();
  }, [movieId, selectedCity]);

  const initData = async () => {
    try {
      const [mRes, tRes] = await Promise.allSettled([
        movieAPI.getAll({ status: 'now_showing' }),
        theatreAPI.getAll({ city: selectedCity })
      ]);
      if (mRes.status === 'fulfilled' && mRes.value?.data?.movies?.length > 0) {
        setMoviesList(mRes.value.data.movies);
        if (movieId) {
          const match = mRes.value.data.movies.find(m => m._id === movieId);
          if (match) setSelectedMovie(match);
        }
      }
      if (tRes.status === 'fulfilled' && tRes.value?.data?.theatres?.length > 0) {
        setTheatresList(tRes.value.data.theatres);
      }
    } catch (_) {}
  };

  // When user picks a showtime button
  const handlePickShowtime = async (theatre, showtime) => {
    setSelectedTheatre(theatre);
    setSelectedShowtime(showtime);
    setSelectedSeats([]);

    try {
      const { data } = await showtimeAPI.getSeats(showtime._id);
      if (data.success && data.showtime?.seats?.length > 0) {
        setSeatMatrix(data.showtime.seats);
      } else {
        setSeatMatrix(generateSeatGrid());
      }
    } catch (_) {
      setSeatMatrix(generateSeatGrid());
    }

    setStep(2); // Go directly to seat map
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle Seat Selection
  const toggleSeat = (seat) => {
    if (seat.isBooked || seat.isBlocked) return;
    const isSelected = selectedSeats.some(s => s.seatNumber === seat.seatNumber);

    if (isSelected) {
      setSelectedSeats(prev => prev.filter(s => s.seatNumber !== seat.seatNumber));
    } else {
      if (selectedSeats.length >= MAX_SEATS) {
        toast.error(`Maximum ${MAX_SEATS} seats allowed per transaction`);
        return;
      }
      setSelectedSeats(prev => [...prev, seat]);
    }
  };

  // Pricing
  const subtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const convenienceFee = selectedSeats.length > 0 ? Math.round(subtotal * 0.02) : 0;
  const totalAmount = Math.max(0, subtotal + convenienceFee - discountAmount);

  // Apply Coupon
  const handleApplyCoupon = (codeToApply) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) return;

    const match = INITIAL_OFFERS.find(o => o.couponCode === code);
    if (match && subtotal >= match.minOrderAmount) {
      const disc = match.discountType === 'percentage'
        ? Math.min(Math.round((subtotal * match.discountValue) / 100), match.maxDiscount || 200)
        : match.discountValue;
      setDiscountAmount(disc);
      setCouponApplied({ ...match, discountAmount: disc });
      toast.success(`Coupon "${match.couponCode}" applied! Saved ₹${disc}`);
    } else {
      toast.error('Coupon code is invalid or order amount does not meet minimum');
    }
  };

  // Complete Simulated Booking
  const handleCompleteBooking = async () => {
    setProcessingPayment(true);
    try {
      const payload = {
        showtimeId: selectedShowtime?._id || 'st_demo',
        selectedSeats: selectedSeats.map(s => ({
          seatNumber: s.seatNumber,
          row: s.row,
          category: s.category
        })),
        couponCode: couponApplied?.couponCode || '',
        paymentMethod
      };

      const { data } = await bookingAPI.create(payload);
      if (data.success && data.booking) {
        setConfirmedBooking(data.booking);
        setStep(4);
        toast.success('Tickets confirmed!');
        setProcessingPayment(false);
        return;
      }
    } catch (_) {}

    // Safe simulated instant confirmation
    setTimeout(() => {
      const demoId = `IMV${Date.now().toString(36).toUpperCase()}`;
      setConfirmedBooking({
        bookingId: demoId,
        showtime: {
          movie: selectedMovie,
          theatre: selectedTheatre,
          date: selectedDate,
          startTime: selectedShowtime?.startTime || '17:30'
        },
        selectedSeats,
        totalAmount,
        convenienceFee,
        discountAmount,
        finalAmount: totalAmount,
        paymentStatus: 'completed'
      });
      setStep(4);
      toast.success('Booking Confirmed! Enjoy your movie!');
      setProcessingPayment(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 500);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 max-w-6xl mx-auto text-white">
      {/* Visual Stepper Bar */}
      <div className="mb-8 max-w-xl mx-auto">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-white/10 z-0" />
          {[
            { num: 1, label: 'Cinema & Time' },
            { num: 2, label: 'Select Seats' },
            { num: 3, label: 'Checkout' },
            { num: 4, label: 'E-Ticket' }
          ].map((s) => (
            <div key={s.num} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  step === s.num
                    ? 'bg-purple-600 text-white ring-4 ring-purple-600/30'
                    : step > s.num
                    ? 'bg-green-600 text-white'
                    : 'bg-[#1A1A27] text-gray-500 border border-white/10'
                }`}
              >
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-[10px] font-semibold mt-1.5 hidden sm:block ${
                step >= s.num ? 'text-white' : 'text-gray-500'
              }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Movie Information Header Banner */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={selectedMovie.poster}
            alt={selectedMovie.title}
            className="w-14 h-20 object-cover rounded-xl shrink-0 border border-white/10"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {selectedMovie.certificate || 'UA'}
              </span>
              <span className="text-xs text-gray-400">{selectedMovie.language?.join(', ')}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-display text-white">{selectedMovie.title}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{selectedMovie.genre?.join(', ')} • {selectedMovie.duration} mins</p>
          </div>
        </div>

        {/* Change Movie Picker */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedMovie._id}
            onChange={(e) => {
              const match = moviesList.find(m => m._id === e.target.value);
              if (match) setSelectedMovie(match);
            }}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 focus:outline-none focus:border-purple-500 w-full sm:w-48"
          >
            {moviesList.map(m => (
              <option key={m._id} value={m._id} className="bg-[#12121A]">{m.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ============================================================== */}
      {/* STEP 1: SELECT DATE & THEATRE SHOWTIMES                         */}
      {/* ============================================================== */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Horizontal Date Picker */}
          <div className="glass-card rounded-2xl p-4 border border-white/10">
            <p className="text-xs uppercase font-bold text-gray-400 mb-3 tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-purple-400" /> Select Screening Date
            </p>
            <div className="flex gap-2.5 overflow-x-auto pb-1 scroll-container">
              {availableDates.map(d => (
                <button
                  key={d.full}
                  onClick={() => setSelectedDate(d.full)}
                  className={`flex flex-col items-center justify-center min-w-[70px] py-2.5 px-3 rounded-xl border transition-all cursor-pointer ${
                    selectedDate === d.full
                      ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase">{d.dayName}</span>
                  <span className="text-base font-extrabold my-0.5">{d.dayNumber}</span>
                  <span className="text-[10px]">{d.month}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theatres and Timings List */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-400" /> Available Theatres in {selectedCity}
            </h2>

            {theatresList.map(theatre => {
              const showtimes = [
                { _id: `st_${theatre._id}_1`, startTime: '10:30', format: '2D', price: 150 },
                { _id: `st_${theatre._id}_2`, startTime: '14:00', format: 'IMAX', price: 250 },
                { _id: `st_${theatre._id}_3`, startTime: '17:30', format: '3D', price: 200 },
                { _id: `st_${theatre._id}_4`, startTime: '21:00', format: 'Dolby', price: 180 },
              ];

              return (
                <div key={theatre._id} className="glass-card rounded-2xl p-5 border border-white/10 hover:border-purple-500/25 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5 mb-4">
                    <div>
                      <h3 className="text-base font-bold text-white">{theatre.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{theatre.address}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {theatre.facilities?.slice(0, 3).map(f => (
                        <span key={f} className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-gray-300">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Showtime Pills */}
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Select Showtime</p>
                    <div className="flex flex-wrap gap-3">
                      {showtimes.map(st => (
                        <button
                          key={st._id}
                          onClick={() => handlePickShowtime(theatre, st)}
                          className="group px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-purple-600 hover:border-purple-500 transition-all flex flex-col items-center cursor-pointer"
                        >
                          <span className="text-sm font-bold text-white group-hover:text-white">
                            {formatTime(st.startTime)}
                          </span>
                          <span className="text-[10px] text-purple-300 group-hover:text-purple-100 mt-0.5">
                            {st.format} • ₹{st.price}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 2: INTERACTIVE SEAT SELECTION                              */}
      {/* ============================================================== */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-white/10">
            {/* Show info bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Screening Info</span>
                <h3 className="text-lg font-bold text-white">{selectedTheatre?.name}</h3>
                <p className="text-xs text-gray-400">
                  {formatDate(selectedDate)} at {formatTime(selectedShowtime?.startTime || '17:30')} • {selectedShowtime?.format || 'IMAX'}
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-gray-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Change Show
              </button>
            </div>

            {/* Cinema Screen Indicator */}
            <div className="max-w-md mx-auto mb-10 text-center">
              <div className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 shadow-lg shadow-purple-500/50 mb-2" />
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Cinema Screen (This Direction)</p>
            </div>

            {/* Seat Map */}
            <div className="overflow-x-auto pb-6 scroll-container">
              <div className="min-w-[460px] max-w-xl mx-auto flex flex-col items-center gap-3">
                {['Platinum', 'Gold', 'Silver'].map(category => {
                  const catSeats = seatMatrix.filter(s => s.category === category);
                  if (catSeats.length === 0) return null;
                  const rows = [...new Set(catSeats.map(s => s.row))];

                  return (
                    <div key={category} className="w-full">
                      <div className="flex items-center justify-between text-xs text-gray-400 border-b border-white/5 pb-1 mb-2 px-2">
                        <span className="font-bold text-purple-300">{category}</span>
                        <span>₹{catSeats[0]?.price}</span>
                      </div>

                      <div className="space-y-1.5">
                        {rows.map(row => (
                          <div key={row} className="flex items-center justify-center gap-1.5">
                            <span className="w-4 text-[10px] text-gray-500 font-mono text-center font-bold">{row}</span>
                            <div className="flex gap-1.5">
                              {catSeats.filter(s => s.row === row).map(seat => {
                                const isSelected = selectedSeats.some(s => s.seatNumber === seat.seatNumber);
                                const isBooked = seat.isBooked || seat.isBlocked;

                                return (
                                  <button
                                    key={seat.seatNumber}
                                    disabled={isBooked}
                                    onClick={() => toggleSeat(seat)}
                                    title={`${seat.seatNumber} - ₹${seat.price}`}
                                    className={`w-7 h-7 rounded-md text-[10px] font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${
                                      isBooked
                                        ? 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed'
                                        : isSelected
                                        ? 'bg-purple-600 text-white border border-purple-400 shadow-md shadow-purple-600/50 scale-105'
                                        : 'bg-white/10 hover:bg-purple-600/30 text-gray-300 border border-white/10 hover:border-purple-400'
                                    }`}
                                  >
                                    {seat.seatNumber.replace(/[A-Z]/, '')}
                                  </button>
                                );
                              })}
                            </div>
                            <span className="w-4 text-[10px] text-gray-500 font-mono text-center font-bold">{row}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Seat Map Legend */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-white/10 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-white/10 border border-white/10" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-purple-600 border border-purple-400" />
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-white/5 border border-white/5 opacity-50" />
                <span>Booked</span>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Order Bar */}
          <div className="glass-card rounded-2xl p-4 sm:p-5 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div>
              <p className="text-xs text-gray-400">
                Selected Seats ({selectedSeats.length}/{MAX_SEATS}):
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {selectedSeats.length > 0 ? (
                  selectedSeats.map(s => (
                    <span key={s.seatNumber} className="px-2 py-0.5 rounded bg-purple-600/30 border border-purple-500/40 font-mono font-bold text-xs text-purple-200">
                      {s.seatNumber} (₹{s.price})
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500 italic">No seats picked yet</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div>
                <span className="text-[10px] text-gray-400 block">Subtotal</span>
                <span className="text-xl font-black text-white">{formatCurrency(subtotal)}</span>
              </div>

              <button
                disabled={selectedSeats.length === 0}
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl btn-primary text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Proceed to Checkout <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 3: CHECKOUT & SIMULATED PAYMENT                            */}
      {/* ============================================================== */}
      {step === 3 && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="glass-card rounded-2xl p-4 sm:p-8 border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold font-display text-white">Order Summary & Checkout</h2>
              <button
                onClick={() => setStep(2)}
                className="text-xs text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Modify Seats
              </button>
            </div>

            {/* Ticket Info Card */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Movie</span>
                <span className="text-white font-bold">{selectedMovie.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Cinema</span>
                <span className="text-white">{selectedTheatre.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date & Showtime</span>
                <span className="text-white">
                  {formatDate(selectedDate)} at {formatTime(selectedShowtime?.startTime || '17:30')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Seats</span>
                <span className="text-purple-300 font-mono font-bold">
                  {selectedSeats.map(s => s.seatNumber).join(', ')} ({selectedSeats.length} Tickets)
                </span>
              </div>
            </div>

            {/* Promo Code section */}
            <div>
              <p className="text-xs uppercase font-bold text-gray-400 mb-2">Apply Promo Voucher</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. IMOVIES30"
                  className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs uppercase focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => handleApplyCoupon()}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {/* Quick voucher chips */}
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => { setCouponCode('IMOVIES30'); handleApplyCoupon('IMOVIES30'); }}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-600/20 border border-dashed border-purple-500/40 text-[10px] text-purple-300 font-mono cursor-pointer"
                >
                  IMOVIES30 (30% OFF)
                </button>
                <button
                  type="button"
                  onClick={() => { setCouponCode('WEEKEND100'); handleApplyCoupon('WEEKEND100'); }}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-600/20 border border-dashed border-purple-500/40 text-[10px] text-purple-300 font-mono cursor-pointer"
                >
                  WEEKEND100 (₹100 OFF)
                </button>
              </div>

              {couponApplied && (
                <p className="text-xs text-green-400 mt-2 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Coupon applied (-₹{couponApplied.discountAmount})
                </p>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 pt-4 border-t border-white/10 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Tickets Subtotal</span>
                <span className="text-white font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Convenience Fee (2%)</span>
                <span className="text-white font-medium">{formatCurrency(convenienceFee)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-400 font-semibold">
                  <span>Promo Discount</span>
                  <span>- {formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/10">
                <span>Total Amount Due</span>
                <span className="text-purple-400">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <p className="text-xs uppercase font-bold text-gray-400 mb-2">Payment Method</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('demo')}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    paymentMethod === 'demo'
                      ? 'bg-purple-600/20 border-purple-500'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-purple-400 mb-1" />
                  <p className="text-xs font-bold text-white">Instant Sandbox Pay</p>
                  <span className="text-[10px] text-green-400">Instant Demo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    paymentMethod === 'upi'
                      ? 'bg-purple-600/20 border-purple-500'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <Tag className="w-5 h-5 text-purple-400 mb-1" />
                  <p className="text-xs font-bold text-white">UPI / QR Code</p>
                  <span className="text-[10px] text-gray-400">Simulated</span>
                </button>
              </div>
            </div>

            {/* Pay Button */}
            <button
              disabled={processingPayment}
              onClick={handleCompleteBooking}
              className="w-full py-3.5 rounded-xl btn-primary text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 disabled:opacity-50 cursor-pointer"
            >
              {processingPayment ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing Payment...</>
              ) : (
                <><ShieldCheck className="w-4 h-4" /> Pay {formatCurrency(totalAmount)} & Confirm</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 4: OFFICIAL E-TICKET CONFIRMATION                          */}
      {/* ============================================================== */}
      {step === 4 && confirmedBooking && (
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black font-display text-white">Booking Confirmed!</h2>
            <p className="text-xs text-gray-400">Present this digital ticket at the multiplex entrance</p>
          </div>

          {/* Boarding Pass Ticket */}
          <div className="bg-[#12121A] rounded-3xl border border-white/15 overflow-hidden shadow-2xl">
            {/* Top Bar */}
            <div className="bg-gradient-to-r from-purple-900/60 to-pink-900/40 p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">Booking ID</span>
                <p className="text-base font-mono font-black text-white">{confirmedBooking.bookingId}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                ACTIVE PASS
              </span>
            </div>

            {/* Ticket Details */}
            <div className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Movie</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{confirmedBooking.showtime?.movie?.title}</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Cinema Hall</span>
                  <p className="text-white font-medium mt-0.5 truncate">{confirmedBooking.showtime?.theatre?.name}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Screen</span>
                  <p className="text-white font-medium mt-0.5">Auditorium 2 (IMAX)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Date & Time</span>
                  <p className="text-white font-medium mt-0.5">
                    {formatDate(confirmedBooking.showtime?.date)}<br />
                    {formatTime(confirmedBooking.showtime?.startTime)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Seats</span>
                  <p className="text-purple-300 font-mono font-bold mt-0.5 text-sm">
                    {confirmedBooking.selectedSeats?.map(s => s.seatNumber).join(', ')}
                  </p>
                </div>
              </div>

              {/* Perforated Line Effect */}
              <div className="relative py-2">
                <div className="border-t-2 border-dashed border-white/15" />
                <div className="absolute -left-7 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#0A0A0F]" />
                <div className="absolute -right-7 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#0A0A0F]" />
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center pt-2">
                <div className="bg-white p-3 rounded-2xl shadow-xl">
                  <QRCodeSVG
                    value={JSON.stringify({
                      bookingId: confirmedBooking.bookingId,
                      movie: confirmedBooking.showtime?.movie?.title,
                      seats: confirmedBooking.selectedSeats?.map(s => s.seatNumber)
                    })}
                    size={120}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-2 font-mono">Scan for entry at gate</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={() => { setStep(1); setSelectedSeats([]); setConfirmedBooking(null); }}
              className="flex-1 py-3 rounded-xl btn-primary text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Book Another Show
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
