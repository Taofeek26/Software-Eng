// backend/controllers/favoriteController.js
const db = require('../config/db');

// GET /api/users/me/favorites
exports.getUserFavorites = async (req, res) => {
    const userId = req.user.userId;
    try {
        const result = await db.query(
            'SELECT id, tmdb_movie_id as "tmdbMovieId", title, poster_path as "posterPath", added_at as "addedAt" FROM favorites WHERE user_id = $1 ORDER BY added_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching user favorites:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/users/me/favorites
exports.addMovieToFavorites = async (req, res) => {
    const userId = req.user.userId;
    const { tmdbMovieId, title, posterPath } = req.body;

    if (!tmdbMovieId) {
        return res.status(400).json({ message: 'tmdbMovieId is required' });
    }
    // title and posterPath are optional for storage but good for quick display

    try {
        const result = await db.query(
            'INSERT INTO favorites (user_id, tmdb_movie_id, title, poster_path) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, tmdb_movie_id) DO NOTHING RETURNING *',
            [userId, parseInt(tmdbMovieId), title, posterPath]
        );
        if (result.rows.length === 0) {
            // This means it was already a favorite due to ON CONFLICT DO NOTHING
            // Fetch the existing one to return it or just send a different message
            const existing = await db.query('SELECT * FROM favorites WHERE user_id = $1 AND tmdb_movie_id = $2', [userId, parseInt(tmdbMovieId)]);
            if(existing.rows.length > 0) {
                return res.status(200).json({ message: 'Movie already in favorites.', favorite: existing.rows[0]});
            }
            return res.status(409).json({ message: 'Movie already in favorites or error adding.' });
        }
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding movie to favorites:', error);
        if (error.code === '23503') { // Foreign key violation (user_id not found)
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(500).json({ message: 'Server error', details: error.message });
    }
};

// DELETE /api/users/me/favorites/:tmdbMovieId
exports.removeMovieFromFavorites = async (req, res) => {
    const userId = req.user.userId;
    const { tmdbMovieId } = req.params;

    if (!tmdbMovieId) {
        return res.status(400).json({ message: 'tmdbMovieId parameter is required' });
    }

    try {
        const result = await db.query(
            'DELETE FROM favorites WHERE user_id = $1 AND tmdb_movie_id = $2 RETURNING id',
            [userId, parseInt(tmdbMovieId)]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Favorite not found or not owned by user' });
        }
        res.status(200).json({ message: 'Movie removed from favorites successfully' });
    } catch (error) {
        console.error('Error removing movie from favorites:', error);
        res.status(500).json({ message: 'Server error' });
    }
};