const Movie = require('../models/Movie');

// @desc    Get all movies with filters
// @route   GET /api/movies
// @access  Public
exports.getMovies = async (req, res) => {
  try {
    const {
      search, genre, language, status, rating,
      page = 1, limit = 20, sort = '-releaseDate'
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { director: { $regex: search, $options: 'i' } }
      ];
    }
    if (genre) query.genre = { $in: genre.split(',') };
    if (language) query.language = { $in: language.split(',') };
    if (status) query.status = status;
    if (rating) query.rating = { $gte: parseFloat(rating) };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    res.json({
      success: true,
      count: movies.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      movies
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single movie
// @route   GET /api/movies/:id
// @access  Public
exports.getMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie || !movie.isActive) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.json({ success: true, movie });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create movie (Admin)
// @route   POST /api/movies
// @access  Admin
exports.createMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({ success: true, message: 'Movie created successfully', movie });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update movie (Admin)
// @route   PUT /api/movies/:id
// @access  Admin
exports.updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
    res.json({ success: true, message: 'Movie updated successfully', movie });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete movie (Admin)
// @route   DELETE /api/movies/:id
// @access  Admin
exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
    res.json({ success: true, message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add user to notify list
// @route   POST /api/movies/:id/notify
// @access  Private
exports.addNotifyUser = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });

    if (!movie.notifyUsers.includes(req.user._id)) {
      movie.notifyUsers.push(req.user._id);
      await movie.save();
    }
    res.json({ success: true, message: 'You will be notified when this movie releases!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
