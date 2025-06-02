// backend/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const { updateReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// These routes are for managing a specific review by its ID
// GET /api/movies/:tmdbMovieId/reviews and POST are in movieRoutes.js
// GET /api/users/me/reviews is in userRoutes.js

router.put('/:reviewId', protect, updateReview);
router.delete('/:reviewId', protect, deleteReview);

module.exports = router;