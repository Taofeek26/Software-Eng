// backend/routes/movieRoutes.js
const express = require('express');
const router = express.Router();
const {
    fetchPopularMovies,
    fetchTrendingMovies, // New
    searchMoviesByQuery,
    fetchMovieDetails,
} = require('../controllers/movieController');
const { getReviewsForMovie, createReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/popular', fetchPopularMovies);
router.get('/trending', fetchTrendingMovies); // New
router.get('/search', searchMoviesByQuery);
router.get('/:tmdbMovieId', fetchMovieDetails);

// Reviews for a specific movie
router.get('/:tmdbMovieId/reviews', getReviewsForMovie);
router.post('/:tmdbMovieId/reviews', protect, createReview);

module.exports = router;