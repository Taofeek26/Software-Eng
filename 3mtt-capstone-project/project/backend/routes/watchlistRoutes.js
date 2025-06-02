// backend/routes/watchlistRoutes.js
const express = require('express');
const router = express.Router();
const {
    getAllUserWatchlists,
    createWatchlist,
    getWatchlistDetails,
    updateWatchlist,
    deleteWatchlist,
    addMovieToWatchlist,
    removeMovieFromWatchlist,
} = require('../controllers/watchlistController');
// protect middleware is applied in userRoutes.js before this router is used.

router.get('/', getAllUserWatchlists); // GET /api/users/me/watchlists
router.post('/', createWatchlist); // POST /api/users/me/watchlists

router.get('/:watchlistId', getWatchlistDetails); // GET /api/users/me/watchlists/:watchlistId
router.put('/:watchlistId', updateWatchlist); // PUT /api/users/me/watchlists/:watchlistId
router.delete('/:watchlistId', deleteWatchlist); // DELETE /api/users/me/watchlists/:watchlistId

router.post('/:watchlistId/movies', addMovieToWatchlist); // POST /api/users/me/watchlists/:watchlistId/movies
router.delete('/:watchlistId/movies/:tmdbMovieId', removeMovieFromWatchlist); // DELETE /api/users/me/watchlists/:watchlistId/movies/:tmdbMovieId

module.exports = router;