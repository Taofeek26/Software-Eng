// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const userRoutes = require('./routes/userRoutes'); // New
const reviewRoutes = require('./routes/reviewRoutes'); // New (for specific review management)
const genreRoutes = require('./routes/genreRoutes'); // New

const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes); // Handles /api/movies/:tmdbMovieId/reviews
app.use('/api/users', userRoutes);   // Handles /api/users/me, /api/users/me/favorites, /api/users/me/watchlists, /api/users/me/reviews
app.use('/api/reviews', reviewRoutes); // Handles /api/reviews/:reviewId
app.use('/api/genres', genreRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});