// backend/controllers/movieController.js
const tmdbService = require('../services/tmdbService');

exports.fetchPopularMovies = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const data = await tmdbService.getPopularMovies(page);
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Error fetching popular movies' });
    }
};

// backend/controllers/movieController.js
// ...
exports.fetchMovieDetails = async (req, res) => {
    try {
        const movieId = req.params.tmdbMovieId; // Or req.params.tmdbMovieId, check your route definition
        console.log(`movieController: Received request for movie ID: ${movieId}`); // Log
        if (!movieId) {
            console.log("movieController: Movie ID is missing in request params."); // Log
            return res.status(400).json({ message: 'Movie ID is required' }); // This could be the source
        }
        const data = await tmdbService.getMovieDetails(movieId);
        res.json(data);
    } catch (error) {
        console.error('movieController: Error in fetchMovieDetails:', error.message); // Log
        // Check the error type coming from tmdbService
        if (error.message.includes('external API')) {
            res.status(502).json({ message: 'Error fetching data from external movie service', details: error.message }); // Bad Gateway
        } else if (error.message.includes('TMDB API Key is missing')) {
            res.status(500).json({ message: 'Server configuration error regarding TMDB API Key.'});
        }
        else {
            res.status(500).json({ message: error.message || 'Error fetching movie details' });
        }
    }
};


// GET /api/movies/search (update to include genre/year if possible with tmdbService)
exports.searchMoviesByQuery = async (req, res) => {
    try {
        const { query, genre, year, page = 1 } = req.query; // TMDB calls it 'primary_release_year'
        if (!query && !genre && !year) { // At least one search criteria
             return res.status(400).json({ message: 'Search query (query), genre, or year is required' });
        }
        // Note: tmdbService.searchMovies currently only takes query.
        // For combined filtering (genre, year), TMDB's /discover/movie endpoint is better.
        // You'd need to update tmdbService or use /discover/movie for this.
        // For now, this example prioritizes the 'query' parameter if present.
        let data;
        if(query) {
            data = await tmdbService.searchMovies(query, page);
        } else {
            // Placeholder for /discover/movie logic
            // data = await tmdbService.discoverMovies({ genre, year, page });
            // For now, let's just return an error if only genre/year is provided without query
            // as our current tmdbService.searchMovies is for text query
            return res.status(501).json({ message: 'Genre/year only search not fully implemented with current TMDB service. Use /discover/movie endpoint with TMDB API for better results.'})
        }

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Error searching movies' });
    }
};


// GET /api/movies/trending
exports.fetchTrendingMovies = async (req, res) => {
    try {
        const { time_window = 'day', page = 1 } = req.query; // time_window can be 'day' or 'week'
        const data = await tmdbService.getTrendingMovies(time_window, page); // Add this to tmdbService
        res.json(data);
    } catch (error) {
        console.error('Error fetching trending movies:', error);
        res.status(500).json({ message: error.message || 'Error fetching trending movies' });
    }
};