// backend/controllers/reviewController.js
const db = require('../config/db');

// GET /api/movies/:tmdbMovieId/reviews
exports.getReviewsForMovie = async (req, res) => {
    const { tmdbMovieId } = req.params;
    try {
        const result = await db.query(
            `SELECT r.id, r.rating, r.comment, r.created_at, r.updated_at, 
                    u.id as user_id, u.username as user_username -- Select user details you want to expose
             FROM reviews r
             JOIN users u ON r.user_id = u.id
             WHERE r.tmdb_movie_id = $1 
             ORDER BY r.created_at DESC`,
            [parseInt(tmdbMovieId)]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching reviews for movie:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/movies/:tmdbMovieId/reviews
exports.createReview = async (req, res) => {
    const userId = req.user.userId;
    const { tmdbMovieId } = req.params; // <--- THIS IS WHERE IT'S EXTRACTED
    const { rating, comment } = req.body;

    // SERVER-SIDE VALIDATION
    if (!tmdbMovieId) {
        // This would likely result in a routing error before even hitting this controller
        // if the route is defined as /:tmdbMovieId/ and no ID is provided in the URL.
        // However, if it somehow reached here as undefined (e.g. if the param name was misspelled in the route)
        return res.status(400).json({ message: 'Movie ID is required in the URL path.' });
    }

    // Your existing validation for rating
    if (rating === undefined || rating === null) { /* ... */ }
    // ...

    try {
        const result = await db.query(
            // Make sure you are parsing tmdbMovieId correctly if it's a string from params
            'INSERT INTO reviews (user_id, tmdb_movie_id, rating, comment) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, tmdb_movie_id) DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, updated_at = CURRENT_TIMESTAMP RETURNING ...',
            [userId, parseInt(tmdbMovieId), rating, comment || null]
        );
        // ...
    } catch (error) { /* ... */ }
};

// PUT /api/reviews/:reviewId
exports.updateReview = async (req, res) => {
    const userId = req.user.userId;
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    if (rating === undefined && (!comment || comment.trim() === '')) {
        return res.status(400).json({ message: 'Rating or comment is required for update' });
    }
    if (rating !== undefined && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
        return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    try {
        const reviewCheck = await db.query('SELECT user_id FROM reviews WHERE id = $1', [reviewId]);
        if (reviewCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }
        if (reviewCheck.rows[0].user_id !== userId) {
            return res.status(403).json({ message: 'Forbidden: You can only update your own reviews' });
        }

        const result = await db.query(
            'UPDATE reviews SET rating = $1, comment = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4 RETURNING *',
            [rating, comment, reviewId, userId]
        );

        if (result.rows.length === 0) {
            // This case should ideally be caught by the checks above, but as a fallback
            return res.status(404).json({ message: 'Review not found or not owned by user' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ message: 'Server error', details: error.message });
    }
};

// DELETE /api/reviews/:reviewId
exports.deleteReview = async (req, res) => {
    const userId = req.user.userId;
    const { reviewId } = req.params;

    try {
        const reviewCheck = await db.query('SELECT user_id FROM reviews WHERE id = $1', [reviewId]);
        if (reviewCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }
        if (reviewCheck.rows[0].user_id !== userId) {
            return res.status(403).json({ message: 'Forbidden: You can only delete your own reviews' });
        }

        const result = await db.query('DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING id', [reviewId, userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Review not found or failed to delete' });
        }
        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/users/me/reviews
exports.getReviewsByUser = async (req, res) => { // This is already covered by GET /api/users/me
    const userId = req.user.userId;
    try {
        const result = await db.query(
            'SELECT id, tmdb_movie_id, rating, comment, created_at, updated_at FROM reviews WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching reviews by user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};