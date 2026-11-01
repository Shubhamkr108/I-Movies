const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, getAllBookings, toggleUserStatus } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes are protected
router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/bookings', getAllBookings);
router.patch('/users/:id/toggle', toggleUserStatus);

module.exports = router;
