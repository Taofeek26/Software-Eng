// src/services/apiService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api'; // Your backend URL

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add JWT token to requests
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const getPopularMovies = (page = 1) => {
    return apiClient.get(`/movies/popular?page=${page}`);
};

export const searchMovies = (query, page = 1) => {
    return apiClient.get(`/movies/search?query=${encodeURIComponent(query)}&page=${page}`);
};

export const getMovieDetails = (tmdbId) => {
    return apiClient.get(`/movies/${tmdbId}`);
};

export const getMovieReviews = (tmdbId) => {
    return apiClient.get(`/movies/${tmdbId}/reviews`);
};

// --- Auth Services (Phase 3) ---
export const registerUser = (userData) => {
    return apiClient.post('/auth/register', userData);
};

export const loginUser = (credentials) => {
    return apiClient.post('/auth/login', credentials);
};

// --- User Services (Phase 3) ---
export const getCurrentUserProfile = () => {
    return apiClient.get('/users/me');
};

export const updateUserProfile = (profileData) => {
    return apiClient.put('/users/me', profileData);
};

// --- Favorite Services (Phase 3) ---
export const addFavorite = (movieData) => { // movieData: { tmdbMovieId, title, posterPath }
    return apiClient.post('/users/me/favorites', movieData);
};

export const removeFavorite = (tmdbMovieId) => {
    return apiClient.delete(`/users/me/favorites/${tmdbMovieId}`);
};

// --- Watchlist Services (Phase 3) ---
export const createWatchlist = (watchlistData) => { // { name }
    return apiClient.post('/users/me/watchlists', watchlistData);
};

export const addMovieToWatchlist = (watchlistId, movieData) => { // movieData: { tmdbMovieId, title, posterPath }
    return apiClient.post(`/users/me/watchlists/${watchlistId}/movies`, movieData);
};

export const removeMovieFromWatchlist = (watchlistId, tmdbMovieId) => {
    return apiClient.delete(`/users/me/watchlists/${watchlistId}/movies/${tmdbMovieId}`);
};

export const deleteWatchlist = (watchlistId) => {
    return apiClient.delete(`/users/me/watchlists/${watchlistId}`);
};
// --- Review Services (Phase 3) ---
export const postReview = (tmdbMovieId, reviewData) => { // { rating, comment }
    // VALIDATION CHECK (Client-side, good to have but backend must also validate)
    if (!tmdbMovieId) {
        console.error("apiService.postReview: tmdbMovieId is undefined or null!");
        // You could throw an error here or return a rejected Promise
        // to make it clear where the issue originates on the client-side.
        return Promise.reject(new Error("Client Error: Movie ID is required for posting a review."));
    }
    return apiClient.post(`/movies/${tmdbMovieId}/reviews`, reviewData);
};

export const updateReview = (reviewId, reviewData) => {
    return apiClient.put(`/reviews/${reviewId}`, reviewData);
};

export const deleteReview = (reviewId) => {
    return apiClient.delete(`/reviews/${reviewId}`);
};


export default apiClient; // Export default for direct use if needed