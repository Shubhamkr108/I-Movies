const express = require('express');
const router = express.Router();
const { getShowtimes, getShowtimeSeats, createShowtime, updateShowtime, deleteShowtime } = require('../controllers/showtimeController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getShowtimes);
router.get('/:id/seats', getShowtimeSeats);
router.post('/', protect, adminOnly, createShowtime);
router.put('/:id', protect, adminOnly, updateShowtime);
router.delete('/:id', protect, adminOnly, deleteShowtime);

module.exports = router;
