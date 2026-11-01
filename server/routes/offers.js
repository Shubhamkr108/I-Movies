const express = require('express');
const router = express.Router();
const { getOffers, validateCoupon, createOffer, updateOffer, deleteOffer } = require('../controllers/offerController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getOffers);
router.post('/validate', protect, validateCoupon);
router.post('/', protect, adminOnly, createOffer);
router.put('/:id', protect, adminOnly, updateOffer);
router.delete('/:id', protect, adminOnly, deleteOffer);

module.exports = router;
