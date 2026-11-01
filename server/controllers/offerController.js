const Offer = require('../models/Offer');

// @desc    Get all active offers
// @route   GET /api/offers
// @access  Public
exports.getOffers = async (req, res) => {
  try {
    const offers = await Offer.find({
      isActive: true,
      expiryDate: { $gte: new Date() }
    }).select('-__v').sort('-createdAt');

    res.json({ success: true, count: offers.length, offers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Validate coupon
// @route   POST /api/offers/validate
// @access  Private
exports.validateCoupon = async (req, res) => {
  try {
    const { couponCode, amount } = req.body;

    if (!couponCode) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const offer = await Offer.findOne({
      couponCode: couponCode.toUpperCase(),
      isActive: true,
      expiryDate: { $gte: new Date() }
    });

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    if (offer.usageLimit && offer.usedCount >= offer.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }

    if (amount < offer.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount ₹${offer.minOrderAmount} required for this coupon`
      });
    }

    let discountAmount = 0;
    if (offer.discountType === 'percentage') {
      discountAmount = (amount * offer.discountValue) / 100;
      if (offer.maxDiscount) discountAmount = Math.min(discountAmount, offer.maxDiscount);
    } else {
      discountAmount = Math.min(offer.discountValue, amount);
    }

    res.json({
      success: true,
      message: `Coupon applied! You save ₹${Math.round(discountAmount)}`,
      offer: {
        title: offer.title,
        couponCode: offer.couponCode,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        discountAmount: Math.round(discountAmount)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create offer (Admin)
// @route   POST /api/offers
// @access  Admin
exports.createOffer = async (req, res) => {
  try {
    const offer = await Offer.create(req.body);
    res.status(201).json({ success: true, message: 'Offer created', offer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update offer (Admin)
// @route   PUT /api/offers/:id
// @access  Admin
exports.updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    res.json({ success: true, offer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete offer (Admin)
// @route   DELETE /api/offers/:id
// @access  Admin
exports.deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    res.json({ success: true, message: 'Offer deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
