const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Offer title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Offer description is required'],
    trim: true
  },
  couponCode: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'flat'],
    required: true,
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: 0
  },
  maxDiscount: {
    type: Number,
    default: null
  },
  minOrderAmount: {
    type: Number,
    default: 0
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  usageLimit: {
    type: Number,
    default: null
  },
  usedCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    default: ''
  },
  applicableFor: {
    type: String,
    enum: ['all', 'new_users', 'specific_bank'],
    default: 'all'
  },
  bankName: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

offerSchema.index({ couponCode: 1 });
offerSchema.index({ expiryDate: 1 });

module.exports = mongoose.model('Offer', offerSchema);
