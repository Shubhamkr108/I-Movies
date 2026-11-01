const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Offer = require('../models/Offer');
const QRCode = require('qrcode');
const mongoose = require('mongoose');

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  let session = null;
  let useTransaction = false;

  try {
    session = await mongoose.startSession();
    session.startTransaction();
    useTransaction = true;
  } catch (sessErr) {
    // MongoDB standalone instance does not support transactions; proceed without transaction
    session = null;
    useTransaction = false;
  }

  try {
    const { showtimeId, selectedSeats, couponCode, paymentMethod = 'demo' } = req.body;

    if (!selectedSeats || selectedSeats.length === 0) {
      if (useTransaction) await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Please select at least one seat' });
    }

    if (selectedSeats.length > 10) {
      if (useTransaction) await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Maximum 10 seats can be booked at once' });
    }

    // Find showtime
    let showtimeQuery = Showtime.findById(showtimeId)
      .populate('movie', 'title poster duration')
      .populate('theatre', 'name city address');

    if (useTransaction) showtimeQuery = showtimeQuery.session(session);
    const showtime = await showtimeQuery;

    if (!showtime || !showtime.isActive) {
      if (useTransaction) await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Showtime not found or unavailable' });
    }

    // Validate seats are available
    const seatNumbers = selectedSeats.map(s => s.seatNumber);
    const unavailableSeats = [];

    for (const seatNum of seatNumbers) {
      const seat = showtime.seats.find(s => s.seatNumber === seatNum);
      if (!seat) {
        unavailableSeats.push(`${seatNum} (not found)`);
      } else if (seat.isBooked || seat.isBlocked) {
        unavailableSeats.push(`${seatNum} (already booked)`);
      }
    }

    if (unavailableSeats.length > 0) {
      if (useTransaction) await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: `Seats unavailable: ${unavailableSeats.join(', ')}. Please select different seats.`
      });
    }

    // Calculate total amount
    let totalAmount = 0;
    const bookingSeats = [];

    for (const selectedSeat of selectedSeats) {
      const seat = showtime.seats.find(s => s.seatNumber === selectedSeat.seatNumber);
      const price = showtime.pricing[seat.category] || 200;
      totalAmount += price;
      bookingSeats.push({
        seatNumber: seat.seatNumber,
        row: seat.row,
        category: seat.category,
        price
      });
    }

    // Apply coupon if provided
    let discountAmount = 0;
    let appliedCoupon = '';

    if (couponCode) {
      let offerQuery = Offer.findOne({
        couponCode: couponCode.toUpperCase(),
        isActive: true,
        expiryDate: { $gte: new Date() }
      });
      if (useTransaction) offerQuery = offerQuery.session(session);
      const offer = await offerQuery;

      if (offer && totalAmount >= offer.minOrderAmount) {
        if (offer.discountType === 'percentage') {
          discountAmount = (totalAmount * offer.discountValue) / 100;
          if (offer.maxDiscount) discountAmount = Math.min(discountAmount, offer.maxDiscount);
        } else {
          discountAmount = Math.min(offer.discountValue, totalAmount);
        }
        offer.usedCount += 1;
        if (useTransaction) await offer.save({ session });
        else await offer.save();
        appliedCoupon = couponCode.toUpperCase();
      }
    }

    const convenienceFee = Math.round(totalAmount * 0.02); // 2% convenience fee
    const finalAmount = Math.round(totalAmount - discountAmount + convenienceFee);

    // Mark seats as booked in showtime
    for (const seatNum of seatNumbers) {
      const seatIdx = showtime.seats.findIndex(s => s.seatNumber === seatNum);
      if (seatIdx !== -1) {
        showtime.seats[seatIdx].isBooked = true;
      }
    }
    showtime.availableSeats = showtime.seats.filter(s => !s.isBooked && !s.isBlocked).length;
    if (useTransaction) await showtime.save({ session });
    else await showtime.save();

    // Create booking
    const booking = new Booking({
      user: req.user._id,
      showtime: showtimeId,
      selectedSeats: bookingSeats,
      totalAmount,
      convenienceFee,
      discountAmount,
      couponCode: appliedCoupon,
      finalAmount,
      paymentStatus: 'completed', // Demo payment
      paymentMethod,
      paymentId: `PAY_DEMO_${Date.now()}`,
      bookingStatus: 'confirmed'
    });

    if (useTransaction) await booking.save({ session });
    else await booking.save();

    // Generate QR code
    const qrData = JSON.stringify({
      bookingId: booking.bookingId,
      movie: showtime.movie.title,
      theatre: showtime.theatre.name,
      date: showtime.date,
      time: showtime.startTime,
      seats: seatNumbers.join(', ')
    });
    const qrCode = await QRCode.toDataURL(qrData);
    booking.qrCode = qrCode;

    if (useTransaction) await booking.save({ session });
    else await booking.save();

    if (useTransaction) await session.commitTransaction();

    // Populate and return
    const populatedBooking = await Booking.findById(booking._id)
      .populate({ path: 'showtime', populate: [{ path: 'movie' }, { path: 'theatre' }] })
      .populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Booking confirmed! Enjoy your movie!',
      booking: populatedBooking
    });
  } catch (error) {
    if (useTransaction && session) {
      try { await session.abortTransaction(); } catch (_) {}
    }
    console.error('Booking error:', error);
    res.status(500).json({ success: false, message: error.message || 'Booking failed' });
  } finally {
    if (session) {
      try { session.endSession(); } catch (_) {}
    }
  }
};

// @desc    Get my bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({ path: 'showtime', populate: [{ path: 'movie', select: 'title poster duration genre' }, { path: 'theatre', select: 'name city address' }] })
      .sort('-createdAt');

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      $or: [{ _id: req.params.id }, { bookingId: req.params.id }],
      user: req.user._id
    }).populate({ path: 'showtime', populate: [{ path: 'movie' }, { path: 'theatre' }] })
      .populate('user', 'name email phone');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.cancelBooking = async (req, res) => {
  let session = null;
  let useTransaction = false;

  try {
    session = await mongoose.startSession();
    session.startTransaction();
    useTransaction = true;
  } catch (_) {
    session = null;
    useTransaction = false;
  }

  try {
    let bookingQuery = Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (useTransaction) bookingQuery = bookingQuery.session(session);
    const booking = await bookingQuery;

    if (!booking) {
      if (useTransaction) await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.bookingStatus === 'cancelled') {
      if (useTransaction) await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Booking already cancelled' });
    }

    // Check if cancellation is within allowed time (2 hours before show)
    let showtimeQuery = Showtime.findById(booking.showtime);
    if (useTransaction) showtimeQuery = showtimeQuery.session(session);
    const showtime = await showtimeQuery;

    if (showtime) {
      const showDate = new Date(showtime.date);
      const [hours, mins] = showtime.startTime.split(':').map(Number);
      showDate.setHours(hours, mins, 0, 0);
      const hoursLeft = (showDate - new Date()) / (1000 * 60 * 60);

      if (hoursLeft < 2) {
        if (useTransaction) await session.abortTransaction();
        return res.status(400).json({ success: false, message: 'Cancellation not allowed within 2 hours of show time' });
      }

      // Release seats
      const seatNumbers = booking.selectedSeats.map(s => s.seatNumber);
      for (const seatNum of seatNumbers) {
        const seatIdx = showtime.seats.findIndex(s => s.seatNumber === seatNum);
        if (seatIdx !== -1) showtime.seats[seatIdx].isBooked = false;
      }
      showtime.availableSeats = showtime.seats.filter(s => !s.isBooked && !s.isBlocked).length;
      if (useTransaction) await showtime.save({ session });
      else await showtime.save();
    }

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.cancellationReason = req.body.reason || 'User cancelled';
    booking.cancelledAt = new Date();

    if (useTransaction) await booking.save({ session });
    else await booking.save();

    if (useTransaction) await session.commitTransaction();
    res.json({ success: true, message: 'Booking cancelled successfully. Refund initiated.' });
  } catch (error) {
    if (useTransaction && session) {
      try { await session.abortTransaction(); } catch (_) {}
    }
    res.status(500).json({ success: false, message: error.message });
  } finally {
    if (session) {
      try { session.endSession(); } catch (_) {}
    }
  }
};
