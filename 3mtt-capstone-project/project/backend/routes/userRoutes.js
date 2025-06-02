// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getCurrentUserProfile, updateUserProfile } = require('../controllers/userController');
const { getReviewsByUser } = require('../controllers/reviewController'); // For /me/reviews
const { protect } = require('../middleware/authMiddleware');

const favoriteRoutes = require('./favoriteRoutes');
const watchlistRoutes = require('./watchlistRoutes');

router.use(protect); // Protect all routes in this file

router.get('/me', getCurrentUserProfile);
router.put('/me', updateUserProfile);

// Get all reviews by current user
router.get('/me/reviews', getReviewsByUser); // Note: /api/users/me already includes reviews. This is redundant but matches spec.

// Nested routes for favorites and watchlists
router.use('/me/favorites', favoriteRoutes);
router.use('/me/watchlists', watchlistRoutes);

module.exports = router;