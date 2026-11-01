const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getBooking, cancelBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.use(protect); // All booking routes are protected

router.post('/', createBooking);
router.get('/my-bookings', getMyBookings);
router.get('/:id', getBooking);
router.delete('/:id', cancelBooking);

module.exports = router;
