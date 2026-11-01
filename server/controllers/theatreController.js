const Theatre = require('../models/Theatre');
const Showtime = require('../models/Showtime');

// @desc    Get all theatres
// @route   GET /api/theatres
// @access  Public
exports.getTheatres = async (req, res) => {
  try {
    const { city, search } = req.query;
    const query = { isActive: true };

    if (city) query.city = { $regex: city, $options: 'i' };
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { address: { $regex: search, $options: 'i' } }
    ];

    const theatres = await Theatre.find(query).sort('name');
    res.json({ success: true, count: theatres.length, theatres });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single theatre
// @route   GET /api/theatres/:id
// @access  Public
exports.getTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre || !theatre.isActive) {
      return res.status(404).json({ success: false, message: 'Theatre not found' });
    }
    res.json({ success: true, theatre });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create theatre (Admin)
// @route   POST /api/theatres
// @access  Admin
exports.createTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.create(req.body);
    res.status(201).json({ success: true, message: 'Theatre created successfully', theatre });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update theatre (Admin)
// @route   PUT /api/theatres/:id
// @access  Admin
exports.updateTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!theatre) return res.status(404).json({ success: false, message: 'Theatre not found' });
    res.json({ success: true, message: 'Theatre updated', theatre });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete theatre (Admin)
// @route   DELETE /api/theatres/:id
// @access  Admin
exports.deleteTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!theatre) return res.status(404).json({ success: false, message: 'Theatre not found' });
    res.json({ success: true, message: 'Theatre deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get unique cities
// @route   GET /api/theatres/cities
// @access  Public
exports.getCities = async (req, res) => {
  try {
    const cities = await Theatre.distinct('city', { isActive: true });
    res.json({ success: true, cities: cities.sort() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
