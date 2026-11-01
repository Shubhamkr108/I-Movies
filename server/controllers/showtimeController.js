const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');

// Generate seat layout helper
const generateSeats = (config) => {
  const seats = [];
  const { silverRows, goldRows, platinumRows, seatsPerRow } = config;

  // Platinum rows (front premium)
  for (let i = 0; i < platinumRows; i++) {
    const row = String.fromCharCode(65 + i); // A, B, C...
    for (let j = 1; j <= seatsPerRow; j++) {
      seats.push({
        seatNumber: `${row}${j}`,
        row,
        category: 'Platinum',
        isBooked: false,
        isBlocked: false
      });
    }
  }

  // Gold rows (middle)
  for (let i = 0; i < goldRows; i++) {
    const row = String.fromCharCode(65 + platinumRows + i);
    for (let j = 1; j <= seatsPerRow; j++) {
      seats.push({
        seatNumber: `${row}${j}`,
        row,
        category: 'Gold',
        isBooked: false,
        isBlocked: false
      });
    }
  }

  // Silver rows (back)
  for (let i = 0; i < silverRows; i++) {
    const row = String.fromCharCode(65 + platinumRows + goldRows + i);
    for (let j = 1; j <= seatsPerRow; j++) {
      seats.push({
        seatNumber: `${row}${j}`,
        row,
        category: 'Silver',
        isBooked: false,
        isBlocked: false
      });
    }
  }

  return seats;
};

// @desc    Get showtimes
// @route   GET /api/showtimes
// @access  Public
exports.getShowtimes = async (req, res) => {
  try {
    const { movieId, theatreId, city, date } = req.query;
    const query = { isActive: true };

    if (movieId) query.movie = movieId;
    if (theatreId) query.theatre = theatreId;
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: d, $lt: nextDay };
    } else {
      // Show today and future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.date = { $gte: today };
    }

    let showtimes = await Showtime.find(query)
      .populate('movie', 'title poster duration genre language rating certificate format')
      .populate('theatre', 'name city address facilities')
      .sort({ date: 1, startTime: 1 })
      .select('-seats');

    // Filter by city via populated theatre
    if (city) {
      showtimes = showtimes.filter(s =>
        s.theatre && s.theatre.city.toLowerCase() === city.toLowerCase()
      );
    }

    res.json({ success: true, count: showtimes.length, showtimes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get showtime with seats
// @route   GET /api/showtimes/:id/seats
// @access  Public
exports.getShowtimeSeats = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movie', 'title poster duration rating certificate')
      .populate('theatre', 'name city address');

    if (!showtime || !showtime.isActive) {
      return res.status(404).json({ success: false, message: 'Showtime not found' });
    }

    res.json({ success: true, showtime });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create showtime (Admin)
// @route   POST /api/showtimes
// @access  Admin
exports.createShowtime = async (req, res) => {
  try {
    const { movie, theatre, date, startTime, format, language, pricing } = req.body;

    // Check movie and theatre exist
    const [movieDoc, theatreDoc] = await Promise.all([
      Movie.findById(movie),
      Theatre.findById(theatre)
    ]);

    if (!movieDoc) return res.status(404).json({ success: false, message: 'Movie not found' });
    if (!theatreDoc) return res.status(404).json({ success: false, message: 'Theatre not found' });

    // Generate seats
    const seats = generateSeats({
      platinumRows: 2,
      goldRows: 4,
      silverRows: 4,
      seatsPerRow: 10
    });

    // Calculate end time
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + movieDoc.duration;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMins = totalMinutes % 60;
    const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

    const showtime = await Showtime.create({
      movie, theatre, date, startTime, endTime, format, language, pricing, seats
    });

    await showtime.populate(['movie', 'theatre']);
    res.status(201).json({ success: true, message: 'Showtime created', showtime });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update showtime (Admin)
// @route   PUT /api/showtimes/:id
// @access  Admin
exports.updateShowtime = async (req, res) => {
  try {
    const showtime = await Showtime.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('movie theatre');
    if (!showtime) return res.status(404).json({ success: false, message: 'Showtime not found' });
    res.json({ success: true, showtime });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete showtime (Admin)
// @route   DELETE /api/showtimes/:id
// @access  Admin
exports.deleteShowtime = async (req, res) => {
  try {
    const showtime = await Showtime.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!showtime) return res.status(404).json({ success: false, message: 'Showtime not found' });
    res.json({ success: true, message: 'Showtime deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
