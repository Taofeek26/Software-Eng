// backend/routes/genreRoutes.js
const express = require('express');
const router = express.Router();
const { fetchGenresFromTMDB, fetchGenresFromDB, syncGenresWithTMDB } = require('../controllers/genreController');
const { protect } = require('../middleware/authMiddleware'); // Assuming sync is admin-only

router.get('/', fetchGenresFromTMDB); // Fetches from TMDB API by default
router.get('/local', fetchGenresFromDB); // Fetches from local DB

// Optional: Admin route to sync genres
// router.post('/sync', protect, ensureAdmin, syncGenresWithTMDB); // ensureAdmin is hypothetical admin check middleware
router.post('/sync', syncGenresWithTMDB); // For now, open or protect as needed

module.exports = router;