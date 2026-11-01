const express = require('express');
const router = express.Router();
const { getMovies, getMovie, createMovie, updateMovie, deleteMovie, addNotifyUser } = require('../controllers/movieController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getMovies);
router.get('/:id', getMovie);
router.post('/', protect, adminOnly, createMovie);
router.put('/:id', protect, adminOnly, updateMovie);
router.delete('/:id', protect, adminOnly, deleteMovie);
router.post('/:id/notify', protect, addNotifyUser);

module.exports = router;
