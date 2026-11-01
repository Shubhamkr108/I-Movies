const User = require('../models/User');
const Movie = require('../models/Movie');
const Theatre = require('../models/Theatre');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Offer = require('../models/Offer');

// @desc    Dashboard stats
// @route   GET /api/admin/dashboard
// @access  Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalMovies,
      totalTheatres,
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      revenueData,
      recentBookings,
      popularMovies,
      monthlyRevenue
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Movie.countDocuments({ isActive: true }),
      Theatre.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ bookingStatus: 'confirmed' }),
      Booking.countDocuments({ bookingStatus: 'cancelled' }),
      Booking.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } }
      ]),
      Booking.find({ bookingStatus: 'confirmed' })
        .populate({ path: 'showtime', populate: [{ path: 'movie', select: 'title poster' }, { path: 'theatre', select: 'name city' }] })
        .populate('user', 'name email')
        .sort('-createdAt')
        .limit(5),
      Booking.aggregate([
        { $match: { bookingStatus: 'confirmed' } },
        { $lookup: { from: 'showtimes', localField: 'showtime', foreignField: '_id', as: 'showtime' } },
        { $unwind: '$showtime' },
        { $group: { _id: '$showtime.movie', bookingCount: { $sum: 1 }, revenue: { $sum: '$finalAmount' } } },
        { $sort: { bookingCount: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'movies', localField: '_id', foreignField: '_id', as: 'movie' } },
        { $unwind: '$movie' },
        { $project: { title: '$movie.title', poster: '$movie.poster', bookingCount: 1, revenue: 1 } }
      ]),
      Booking.aggregate([
        { $match: { paymentStatus: 'completed' } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            revenue: { $sum: '$finalAmount' },
            bookings: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 }
      ])
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalMovies,
        totalTheatres,
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue,
        recentBookings,
        popularMovies,
        monthlyRevenue: monthlyRevenue.reverse()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort('-createdAt')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ success: true, count: users.length, total, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings (admin)
// @route   GET /api/admin/bookings
// @access  Admin
exports.getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.bookingStatus = status;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate({ path: 'showtime', populate: [{ path: 'movie', select: 'title poster' }, { path: 'theatre', select: 'name city' }] })
      .populate('user', 'name email phone')
      .sort('-createdAt')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ success: true, count: bookings.length, total, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle user active status
// @route   PATCH /api/admin/users/:id/toggle
// @access  Admin
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
