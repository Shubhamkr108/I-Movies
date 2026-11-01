const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    default: () => `IMV${uuidv4().replace(/-/g, '').toUpperCase().slice(0, 8)}`
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  showtime: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Showtime',
    required: [true, 'Showtime is required']
  },
  selectedSeats: [{
    seatNumber: { type: String, required: true },
    row: { type: String, required: true },
    category: { type: String, enum: ['Silver', 'Gold', 'Platinum'], required: true },
    price: { type: Number, required: true }
  }],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: 0
  },
  convenienceFee: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  couponCode: {
    type: String,
    default: ''
  },
  finalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet', 'demo'],
    default: 'demo'
  },
  paymentId: {
    type: String,
    default: ''
  },
  bookingStatus: {
    type: String,
    enum: ['confirmed', 'cancelled', 'pending'],
    default: 'pending'
  },
  qrCode: {
    type: String,
    default: ''
  },
  cancellationReason: {
    type: String,
    default: ''
  },
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true
});

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ showtime: 1 });
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
