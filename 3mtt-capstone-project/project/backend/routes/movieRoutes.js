// backend/routes/movieRoutes.js
const express = require('express');
const router = express.Router();
const {
    fetchPopularMovies,
    fetchTrendingMovies, // New
    searchMoviesByQuery,
    fetchMovieDetails,
    fetchTopRatedMovies,
    fetchMovieVideos, // <-- ADD THIS IMPORT
} = require('../controllers/movieController');
const { getReviewsForMovie, createReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/popular', fetchPopularMovies);
router.get('/trending', fetchTrendingMovies);
router.get('/top-rated', fetchTopRatedMovies); // New
router.get('/search', searchMoviesByQuery);


router.get('/:tmdbMovieId/videos', fetchMovieVideos); // <-- ADD THIS ROUTE
router.get('/:tmdbMovieId', fetchMovieDetails);
 // <-- 2. ADD THE NEW ROUTE

// Reviews for a specific movie
router.get('/:tmdbMovieId/reviews', getReviewsForMovie);
router.post('/:tmdbMovieId/reviews', protect, createReview);

module.exports = router;