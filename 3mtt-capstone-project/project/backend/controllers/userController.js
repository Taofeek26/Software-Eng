// backend/controllers/userController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs'); // For password updates if you add that

// GET /api/users/me
exports.getCurrentUserProfile = async (req, res) => {
    const userId = req.user.userId; // From authMiddleware
    try {
        // Fetch user profile
        const userResult = await db.query('SELECT id, username, firstname, lastname, email, created_at FROM users WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userProfile = userResult.rows[0];

        // Fetch user's favorites
        const favoritesResult = await db.query('SELECT tmdb_movie_id, title, poster_path, added_at FROM favorites WHERE user_id = $1 ORDER BY added_at DESC', [userId]);
        userProfile.favorites = favoritesResult.rows;

        // Fetch user's watchlists
        const watchlistsResult = await db.query('SELECT id, name, created_at FROM watchlists WHERE user_id = $1 ORDER BY name ASC', [userId]);
        // For each watchlist, fetch its movies (can be N+1, consider JOINs for optimization later)
        for (let watchlist of watchlistsResult.rows) {
            const moviesResult = await db.query(
                'SELECT tmdb_movie_id, title, poster_path, added_at FROM watchlist_movies WHERE watchlist_id = $1 ORDER BY added_at DESC',
                [watchlist.id]
            );
            watchlist.movies = moviesResult.rows;
        }
        userProfile.watchlists = watchlistsResult.rows;


        // Fetch user's reviews
        const reviewsResult = await db.query('SELECT id, tmdb_movie_id, rating, comment, created_at, updated_at FROM reviews WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        userProfile.reviews = reviewsResult.rows;


        res.json(userProfile);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/users/me
exports.updateUserProfile = async (req, res) => {
    const userId = req.user.userId;
    const { username, firstname, lastname, email } = req.body; // Add other updatable fields as needed

    // Basic validation
    if (!username && !firstname && !lastname && !email) {
        return res.status(400).json({ message: 'No update fields provided' });
    }

    try {
        // Check for username/email conflicts if they are being changed
        if (email) {
            const emailExists = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
            if (emailExists.rows.length > 0) {
                return res.status(400).json({ message: 'Email already in use by another account' });
            }
        }
        if (username) {
            const usernameExists = await db.query('SELECT id FROM users WHERE username = $1 AND id != $2', [username, userId]);
            if (usernameExists.rows.length > 0) {
                return res.status(400).json({ message: 'Username already taken' });
            }
        }

        // Build the update query dynamically
        const fieldsToUpdate = [];
        const values = [];
        let queryIndex = 1;

        if (username !== undefined) {
            fieldsToUpdate.push(`username = $${queryIndex++}`);
            values.push(username);
        }
        if (firstname !== undefined) {
            fieldsToUpdate.push(`firstname = $${queryIndex++}`);
            values.push(firstname);
        }
        if (lastname !== undefined) {
            fieldsToUpdate.push(`lastname = $${queryIndex++}`);
            values.push(lastname);
        }
        if (email !== undefined) {
            fieldsToUpdate.push(`email = $${queryIndex++}`);
            values.push(email);
        }
        // Add more fields here (e.g. bio, avatar_url)

        if (fieldsToUpdate.length === 0) {
             return res.status(400).json({ message: 'No valid fields to update provided.' });
        }

        fieldsToUpdate.push(`updated_at = CURRENT_TIMESTAMP`); // Ensure updated_at is set

        const updateQuery = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE id = $${queryIndex} RETURNING id, username, firstname, lastname, email, created_at, updated_at`;
        values.push(userId);

        const result = await db.query(updateQuery, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Server error', details: error.message });
    }
};