const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Movie title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Movie description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  poster: {
    type: String,
    required: [true, 'Movie poster URL is required']
  },
  backdrop: {
    type: String,
    default: ''
  },
  genre: [{
    type: String,
    enum: ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western', 'Biography', 'Family', 'Musical', 'Sport'],
    required: true
  }],
  language: [{
    type: String,
    default: ['Hindi']
  }],
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be positive']
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  votes: {
    type: Number,
    default: 0
  },
  releaseDate: {
    type: Date,
    required: [true, 'Release date is required']
  },
  cast: [{
    name: { type: String, required: true },
    character: { type: String, default: '' },
    photo: { type: String, default: '' }
  }],
  director: {
    type: String,
    required: [true, 'Director is required']
  },
  trailerUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['now_showing', 'coming_soon', 'ended'],
    default: 'now_showing'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  certificate: {
    type: String,
    enum: ['U', 'UA', 'A', 'S'],
    default: 'UA'
  },
  format: [{
    type: String,
    enum: ['2D', '3D', 'IMAX', '4DX', 'Dolby'],
    default: ['2D']
  }],
  notifyUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Indexes
movieSchema.index({ title: 'text', description: 'text' });
movieSchema.index({ genre: 1 });
movieSchema.index({ status: 1 });
movieSchema.index({ releaseDate: -1 });
movieSchema.index({ rating: -1 });

module.exports = mongoose.model('Movie', movieSchema);
