const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true },
  row: { type: String, required: true },
  category: { type: String, enum: ['Silver', 'Gold', 'Platinum'], required: true },
  isBooked: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false }
}, { _id: false });

const showtimeSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: [true, 'Movie is required']
  },
  theatre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theatre',
    required: [true, 'Theatre is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
  },
  endTime: {
    type: String,
    default: ''
  },
  format: {
    type: String,
    enum: ['2D', '3D', 'IMAX', '4DX', 'Dolby'],
    default: '2D'
  },
  language: {
    type: String,
    default: 'Hindi'
  },
  pricing: {
    Silver: { type: Number, required: true, default: 150 },
    Gold: { type: Number, required: true, default: 250 },
    Platinum: { type: Number, required: true, default: 400 }
  },
  seats: [seatSchema],
  totalSeats: {
    type: Number,
    default: 0
  },
  availableSeats: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Before save, update totalSeats and availableSeats
showtimeSchema.pre('save', function(next) {
  this.totalSeats = this.seats.length;
  this.availableSeats = this.seats.filter(s => !s.isBooked && !s.isBlocked).length;
  next();
});

showtimeSchema.index({ movie: 1, theatre: 1, date: 1 });
showtimeSchema.index({ date: 1 });
showtimeSchema.index({ theatre: 1 });

module.exports = mongoose.model('Showtime', showtimeSchema);
