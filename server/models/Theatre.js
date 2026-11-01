const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Theatre name is required'],
    trim: true,
    maxlength: [150, 'Theatre name cannot exceed 150 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  pincode: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  facilities: [{
    type: String,
    enum: ['Parking', 'Food Court', 'Wheelchair Access', 'Air Conditioned', 'Dolby Atmos', 'IMAX', '4DX', 'Recliner Seats', 'WiFi', 'Lounge', 'Online Booking', 'M-Ticket']
  }],
  mapLink: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  totalScreens: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

theatreSchema.index({ city: 1 });
theatreSchema.index({ name: 'text', city: 'text' });

module.exports = mongoose.model('Theatre', theatreSchema);
