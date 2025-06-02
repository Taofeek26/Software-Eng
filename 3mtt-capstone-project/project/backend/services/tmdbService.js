// backend/services/tmdbService.js
const axios = require('axios');
require('dotenv').config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

if (!TMDB_API_KEY) {
    console.warn("TMDB_API_KEY is not set in .env file. TMDB features will not work.");
}

const tmdbAxiosInstance = axios.create({
    baseURL: TMDB_BASE_URL,
    params: {
        api_key: TMDB_API_KEY,
        language: 'en-US', // Optional: set default language
    },
});

exports.getPopularMovies = async (page = 1) => {
    if (!TMDB_API_KEY) throw new Error("TMDB API Key is missing.");
    try {
        const response = await tmdbAxiosInstance.get('/movie/popular', {
            params: { page },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching popular movies from TMDB:', error.response ? error.response.data : error.message);
        throw new Error('Failed to fetch popular movies');
    }
};

// backend/services/tmdbService.js
// ...
exports.getMovieDetails = async (movieId) => {
    console.log(`tmdbService: Fetching details for movieId: ${movieId}, API Key used: ${TMDB_API_KEY ? 'Exists' : 'MISSING!'}`); // Log
    if (!TMDB_API_KEY) {
        console.error("TMDB API Key is missing in tmdbService.getMovieDetails!");
        throw new Error("TMDB API Key is missing.");
    }
    try {
        const response = await tmdbAxiosInstance.get(`/movie/${movieId}`);
        console.log(`tmdbService: TMDB response status for ${movieId}: ${response.status}`); // Log success
        return response.data;
    } catch (error) {
        console.error(`tmdbService: Error fetching movie details for ID ${movieId} from TMDB:`, error.response ? error.response.data : error.message); // Log error
        // You might want to check error.response.status here to see what TMDB returned
        if (error.response) {
            console.error("TMDB Error Status:", error.response.status);
            console.error("TMDB Error Data:", error.response.data);
        }
        throw new Error('Failed to fetch movie details from external API'); // More specific error
    }
};

exports.searchMovies = async (query, page = 1) => {
    if (!TMDB_API_KEY) throw new Error("TMDB API Key is missing.");
    try {
        const response = await tmdbAxiosInstance.get('/search/movie', {
            params: { query, page },
        });
        return response.data;
    } catch (error) {
        console.error(`Error searching movies with query "${query}":`, error.response ? error.response.data : error.message);
        throw new Error('Failed to search movies');
    }
};

exports.getTrendingMovies = async (timeWindow = 'day', page = 1) => {
    if (!TMDB_API_KEY) throw new Error("TMDB API Key is missing.");
    try {
        const response = await tmdbAxiosInstance.get(`/trending/movie/${timeWindow}`, {
            params: { page },
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching trending movies (${timeWindow}) from TMDB:`, error.response ? error.response.data : error.message);
        throw new Error('Failed to fetch trending movies');
    }
};

exports.getGenres = async () => {
    if (!TMDB_API_KEY) throw new Error("TMDB API Key is missing.");
    try {
        const response = await tmdbAxiosInstance.get('/genre/movie/list');
        return response.data.genres; // TMDB returns { genres: [...] }
    } catch (error) {
        console.error('Error fetching genres from TMDB:', error.response ? error.response.data : error.message);
        throw new Error('Failed to fetch genres');
    }
};

// Optional: for discover endpoint, good for combined filtering
// exports.discoverMovies = async (options = {}) => {
//   const { genre, year, page = 1, sortBy = 'popularity.desc' } = options;
//   const params = { page, sort_by: sortBy };
//   if (genre) params.with_genres = genre; // TMDB uses 'with_genres'
//   if (year) params.primary_release_year = year;

//   try {
//     const response = await tmdbAxiosInstance.get('/discover/movie', { params });
//     return response.data;
//   } catch (error) {
//     console.error('Error discovering movies from TMDB:', error.response ? error.response.data : error.message);
//     throw new Error('Failed to discover movies');
//   }
// };