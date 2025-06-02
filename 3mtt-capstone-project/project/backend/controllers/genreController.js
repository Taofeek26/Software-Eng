// backend/controllers/genreController.js
const tmdbService = require('../services/tmdbService');
const db = require('../config/db');

// GET /api/genres (from TMDB)
exports.fetchGenresFromTMDB = async (req, res) => {
    try {
        const genres = await tmdbService.getGenres();
        res.json(genres);
    } catch (error) {
        console.error('Error fetching genres from TMDB:', error);
        res.status(500).json({ message: 'Failed to fetch genres' });
    }
};

// Optional: GET /api/genres/local (if you populate local genres table)
exports.fetchGenresFromDB = async (req, res) => {
    try {
        const result = await db.query('SELECT id, name FROM genres ORDER BY name ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching genres from DB:', error);
        res.status(500).json({ message: 'Failed to fetch genres from database' });
    }
};

// Optional: POST /api/genres/sync (Admin only - to populate local DB from TMDB)
exports.syncGenresWithTMDB = async (req, res) => {
    // Add admin role check here if implementing
    try {
        const tmdbGenres = await tmdbService.getGenres();
        if (!tmdbGenres || tmdbGenres.length === 0) {
            return res.status(502).json({ message: 'Failed to fetch genres from TMDB or no genres returned.' });
        }

        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            // Clear existing genres or use ON CONFLICT DO UPDATE
            await client.query('DELETE FROM genres');
            for (const genre of tmdbGenres) {
                await client.query('INSERT INTO genres (id, name) VALUES ($1, $2)', [genre.id, genre.name]);
            }
            await client.query('COMMIT');
            res.status(200).json({ message: 'Genres synced successfully with TMDB.', count: tmdbGenres.length });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error syncing genres with TMDB:', error);
        res.status(500).json({ message: 'Failed to sync genres', error: error.message });
    }
};