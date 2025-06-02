// backend/controllers/watchlistController.js
const db = require('../config/db');

// GET /api/users/me/watchlists
exports.getAllUserWatchlists = async (req, res) => {
    const userId = req.user.userId;
    try {
        const result = await db.query(
            'SELECT id, name, created_at, updated_at FROM watchlists WHERE user_id = $1 ORDER BY name ASC',
            [userId]
        );
        // Optionally, fetch movie counts or a few movie posters for each watchlist here
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching user watchlists:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/users/me/watchlists
exports.createWatchlist = async (req, res) => {
    const userId = req.user.userId;
    const { name } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Watchlist name is required' });
    }

    try {
        // Optional: Check if user already has a watchlist with the same name
        // const existing = await db.query('SELECT id FROM watchlists WHERE user_id = $1 AND lower(name) = lower($2)', [userId, name.trim()]);
        // if (existing.rows.length > 0) {
        //     return res.status(409).json({ message: 'A watchlist with this name already exists.' });
        // }

        const result = await db.query(
            'INSERT INTO watchlists (user_id, name) VALUES ($1, $2) RETURNING *',
            [userId, name.trim()]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating watchlist:', error);
        if (error.code === '23505' && error.constraint === 'watchlists_user_id_name_key') { // If you added unique constraint
             return res.status(409).json({ message: 'A watchlist with this name already exists.' });
        }
        res.status(500).json({ message: 'Server error', details: error.message });
    }
};

// GET /api/users/me/watchlists/:watchlistId
exports.getWatchlistDetails = async (req, res) => {
    const userId = req.user.userId;
    const { watchlistId } = req.params;

    try {
        const watchlistResult = await db.query(
            'SELECT id, name, user_id, created_at, updated_at FROM watchlists WHERE id = $1',
            [watchlistId]
        );
        if (watchlistResult.rows.length === 0) {
            return res.status(404).json({ message: 'Watchlist not found' });
        }
        if (watchlistResult.rows[0].user_id !== userId) {
            return res.status(403).json({ message: 'Forbidden: You do not own this watchlist' });
        }

        const watchlist = watchlistResult.rows[0];
        const moviesResult = await db.query(
            'SELECT wm.id as watchlist_movie_id, wm.tmdb_movie_id, wm.title, wm.poster_path, wm.added_at FROM watchlist_movies wm WHERE wm.watchlist_id = $1 ORDER BY wm.added_at DESC',
            [watchlistId]
        );
        watchlist.movies = moviesResult.rows;
        res.json(watchlist);
    } catch (error) {
        console.error('Error fetching watchlist details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/users/me/watchlists/:watchlistId
exports.updateWatchlist = async (req, res) => {
    const userId = req.user.userId;
    const { watchlistId } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'New watchlist name is required' });
    }

    try {
        // Optional: Check for name conflict with other watchlists of the same user
        // const existing = await db.query('SELECT id FROM watchlists WHERE user_id = $1 AND lower(name) = lower($2) AND id != $3', [userId, name.trim(), watchlistId]);
        // if (existing.rows.length > 0) {
        //     return res.status(409).json({ message: 'Another watchlist with this name already exists.' });
        // }

        const result = await db.query(
            'UPDATE watchlists SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
            [name.trim(), watchlistId, userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Watchlist not found or not owned by user' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating watchlist:', error);
        if (error.code === '23505' && error.constraint === 'watchlists_user_id_name_key') { // If unique constraint
             return res.status(409).json({ message: 'Another watchlist with this name already exists.' });
        }
        res.status(500).json({ message: 'Server error', details: error.message });
    }
};

// DELETE /api/users/me/watchlists/:watchlistId
exports.deleteWatchlist = async (req, res) => {
    const userId = req.user.userId;
    const { watchlistId } = req.params;

    try {
        // ON DELETE CASCADE will handle deleting associated watchlist_movies
        const result = await db.query(
            'DELETE FROM watchlists WHERE id = $1 AND user_id = $2 RETURNING id',
            [watchlistId, userId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Watchlist not found or not owned by user' });
        }
        res.status(200).json({ message: 'Watchlist deleted successfully' });
    } catch (error) {
        console.error('Error deleting watchlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/users/me/watchlists/:watchlistId/movies
exports.addMovieToWatchlist = async (req, res) => {
    const userId = req.user.userId;
    const { watchlistId } = req.params;
    const { tmdbMovieId, title, posterPath } = req.body;

    if (!tmdbMovieId) {
        return res.status(400).json({ message: 'tmdbMovieId is required' });
    }

    try {
        // First, verify the watchlist exists and belongs to the user
        const watchlistCheck = await db.query('SELECT id FROM watchlists WHERE id = $1 AND user_id = $2', [watchlistId, userId]);
        if (watchlistCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Watchlist not found or not owned by user' });
        }

        const result = await db.query(
            'INSERT INTO watchlist_movies (watchlist_id, tmdb_movie_id, title, poster_path) VALUES ($1, $2, $3, $4) ON CONFLICT (watchlist_id, tmdb_movie_id) DO NOTHING RETURNING *',
            [watchlistId, parseInt(tmdbMovieId), title, posterPath]
        );

        if (result.rows.length === 0) {
            return res.status(409).json({ message: 'Movie already in this watchlist.' });
        }
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding movie to watchlist:', error);
        res.status(500).json({ message: 'Server error', details: error.message });
    }
};

// DELETE /api/users/me/watchlists/:watchlistId/movies/:tmdbMovieId
exports.removeMovieFromWatchlist = async (req, res) => {
    const userId = req.user.userId;
    const { watchlistId, tmdbMovieId } = req.params;

    try {
        // Verify ownership of the watchlist first (optional, but good for security)
        const watchlistCheck = await db.query('SELECT id FROM watchlists WHERE id = $1 AND user_id = $2', [watchlistId, userId]);
        if (watchlistCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Forbidden: You do not own the parent watchlist' });
        }

        const result = await db.query(
            'DELETE FROM watchlist_movies WHERE watchlist_id = $1 AND tmdb_movie_id = $2 RETURNING id',
            [watchlistId, parseInt(tmdbMovieId)]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Movie not found in this watchlist' });
        }
        res.status(200).json({ message: 'Movie removed from watchlist successfully' });
    } catch (error) {
        console.error('Error removing movie from watchlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
};