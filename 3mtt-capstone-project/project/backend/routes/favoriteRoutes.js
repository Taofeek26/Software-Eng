// backend/routes/favoriteRoutes.js
const express = require('express');
const router = express.Router(); // mergeParams true if it were nested with params from parent
const {
    getUserFavorites,
    addMovieToFavorites,
    removeMovieFromFavorites,
} = require('../controllers/favoriteController');
// protect middleware is applied in userRoutes.js before this router is used.

router.get('/', getUserFavorites); // GET /api/users/me/favorites
router.post('/', addMovieToFavorites); // POST /api/users/me/favorites
router.delete('/:tmdbMovieId', removeMovieFromFavorites); // DELETE /api/users/me/favorites/:tmdbMovieId

module.exports = router;