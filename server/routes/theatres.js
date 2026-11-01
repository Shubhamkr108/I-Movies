const express = require('express');
const router = express.Router();
const { getTheatres, getTheatre, createTheatre, updateTheatre, deleteTheatre, getCities } = require('../controllers/theatreController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/cities', getCities);
router.get('/', getTheatres);
router.get('/:id', getTheatre);
router.post('/', protect, adminOnly, createTheatre);
router.put('/:id', protect, adminOnly, updateTheatre);
router.delete('/:id', protect, adminOnly, deleteTheatre);

module.exports = router;
