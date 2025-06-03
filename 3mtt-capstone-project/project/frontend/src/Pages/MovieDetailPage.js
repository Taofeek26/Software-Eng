// src/pages/MovieDetailPage.js
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../Contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { getMovieDetails, getMovieReviews, removeFavorite, addFavorite} from '../Serivices/apiService'; // Assuming you add getMovieReviews
import './MovieDetailPage.css';
import ReviewForm from '../Components/Review/ReviewForm'; // Import
import { /* other apiService, */ deleteReview, getCurrentUserProfile } from '../Serivices/apiService';
import AddToWatchlistModal from '../Components/WatchList/AddToWatchlistModal'; // Corrected import

const MovieDetailPage = () => {
    const { tmdbId } = useParams();
    const [movie, setMovie] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Favorite State
    const [isFavorite, setIsFavorite] = useState(false);
    const [processingFavorite, setProcessingFavorite] = useState(false);
    const [showWatchlistModal, setShowWatchlistModal] = useState(false);
    const { isAuthenticated, user, login: updateUserInContext } = useContext(AuthContext); // user for ownership
    const [editingReview, setEditingReview] = useState(null); // To hold review being edited

    const refreshReviewsAndProfile = async () => { // Helper to refresh data
        try {
            if (tmdbId) {
                const movieReviewsResponse = await getMovieReviews(tmdbId);
                setReviews(movieReviewsResponse.data);
            }
            if (isAuthenticated) {
                const profileResponse = await getCurrentUserProfile();
                updateUserInContext(localStorage.getItem('token'), profileResponse.data);
            }
        } catch (err) {
            console.error("Error refreshing data:", err);
        }
    };


    const handleReviewSubmitted = (submittedReview) => {
        refreshReviewsAndProfile();
        setEditingReview(null); // Clear editing state
    };

    const handleDeleteReview = async (reviewId) => {
        if (window.confirm("Are you sure you want to delete your review?")) {
            try {
                await deleteReview(reviewId);
                refreshReviewsAndProfile();
            } catch (err) {
                console.error("Error deleting review:", err);
                alert(err.response?.data?.message || "Failed to delete review.");
            }
        }
    };

    useEffect(() => {
        const fetchMovieData = async () => {
            setLoading(true);
            try {
                const movieDetailsResponse = await getMovieDetails(tmdbId);
                setMovie(movieDetailsResponse.data);

                const movieReviewsResponse = await getMovieReviews(tmdbId);
                setReviews(movieReviewsResponse.data); // Assuming backend returns array of reviews

                setError(null);
            } catch (err) {
                console.error(`Error fetching movie details for ID ${tmdbId}:`, err);
                setError(err.response?.data?.message || err.message || 'Failed to fetch movie details');
                setMovie(null);
                setReviews([]);
            } finally {
                setLoading(false);
            }
        };

        if (tmdbId) {
            fetchMovieData();
        }
    }, [tmdbId]);

    // Effect to check if movie is favorited based on user data
    useEffect(() => {
        if (isAuthenticated && user && user.favorites && movie) {
            setIsFavorite(user.favorites.some(fav => fav.tmdbMovieId === parseInt(tmdbId)));
        } else {
            setIsFavorite(false);
        }
    }, [isAuthenticated, user, movie, tmdbId]);


    const handleToggleFavorite = async () => {
        if (!isAuthenticated) {
            alert("Please log in to favorite movies.");
            return;
        }
        if (!movie) return;

        setProcessingFavorite(true);
        try {
            if (isFavorite) {
                await removeFavorite(movie.id);
            } else {
                await addFavorite({
                    tmdbMovieId: movie.id,
                    title: movie.title,
                    posterPath: movie.poster_path
                });
            }
            // Refresh user data in context
            const profileResponse = await getCurrentUserProfile();
            updateUserInContext(localStorage.getItem('token'), profileResponse.data);
            // setIsFavorite will be updated by the useEffect above reacting to user.favorites change
        } catch (error) {
            console.error("Error toggling favorite:", error);
            alert("Could not update favorite status. Please try again.");
        } finally {
            setProcessingFavorite(false);
        }
    };

    if (loading) return <p>Loading movie details...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;
    if (!movie) return <p>Movie not found.</p>;

    const posterBaseUrl = 'https://image.tmdb.org/t/p/w780'; // Larger poster for detail page
    const backdropBaseUrl = 'https://image.tmdb.org/t/p/original';
    const placeholderImage = 'https://via.placeholder.com/780x1170?text=No+Image';

    return (
        <div className="movie-detail-page">
            {movie.backdrop_path && (
                <div className="backdrop-container" style={{ backgroundImage: `url(${backdropBaseUrl}${movie.backdrop_path})` }}>
                    {/* Overlay or content can go here */}
                </div>
            )}
            <div className="movie-content-wrapper">
                <div className="movie-header">
                    <img
                        src={movie.poster_path ? `${posterBaseUrl}${movie.poster_path}` : placeholderImage}
                        alt={movie.title}
                        className="movie-detail-poster"
                    />
                    <div className="movie-header-info">
                        <h1>{movie.title} ({movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'})</h1>
                        <p className="tagline"><em>{movie.tagline}</em></p>
                        <div className="genres">
                            {movie.genres && movie.genres.map(genre => (
                                <span key={genre.id} className="genre-tag">{genre.name}</span>
                            ))}
                        </div>
                        <p><strong>Rating:</strong> {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'} ({movie.vote_count} votes)</p>
                        <p><strong>Runtime:</strong> {movie.runtime} minutes</p>
                        <p><strong>Release Date:</strong> {movie.release_date}</p>
                        
                         {/* Phase 3: Add to Favorites/Watchlist buttons, Review Form */}
                         {isAuthenticated && movie && (
                            <button
                                onClick={handleToggleFavorite}
                                className={`action-button favorite-button-detail ${isFavorite ? 'active' : ''}`}
                                disabled={processingFavorite}
                            >
                                {processingFavorite ? '...' : (isFavorite ? '❤️ Unfavorite' : '🤍 Add to Favorites')}
                            </button>
                        )}
                        {isAuthenticated && (
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowWatchlistModal(true); }}
                                className="action-button watchlist-add-button" // Style this button
                            >
                                + Watchlist
                            </button>
                        )}
                        {showWatchlistModal && movie && (
                            <AddToWatchlistModal movie={movie} onClose={() => setShowWatchlistModal(false)} />
                        )}
                    </div>
                </div>

                <div className="movie-overview">
                    <h2>Overview</h2>
                    <p>{movie.overview}</p>
                </div>

                {/* Stretch goal from Core Features: Cast & Crew can be added here */}
                {/* Example for Cast - TMDB API provides credits: /movie/{movie_id}/credits */}
                {/*
                <div className="movie-cast">
                    <h2>Top Billed Cast</h2>
                    {movie.credits && movie.credits.cast.slice(0, 10).map(actor => ( // TMDB API structure
                        <div key={actor.cast_id} className="cast-member">
                            <img src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} alt={actor.name} />
                            <p>{actor.name}</p>
                            <p>as {actor.character}</p>
                        </div>
                    ))}
                </div>
                */}

                <div className="movie-reviews-section">
                    <h2>User Reviews</h2>
                    {isAuthenticated && !editingReview && movie && (
                        <ReviewForm
                            tmdbMovieId={parseInt(tmdbId)} // Ensure it's an integer if backend expects it
                            onReviewSubmitted={handleReviewSubmitted}
                        />
                    )}
                    {editingReview && ( // Show edit review form
                        <ReviewForm
                            tmdbMovieId={parseInt(tmdbId)}
                            existingReview={editingReview}
                            onReviewSubmitted={handleReviewSubmitted}
                            onCancelEdit={() => setEditingReview(null)}
                        />
                    )}

                    {reviews.length > 0 ? (
                        <ul className="reviews-list">
                            {reviews.map(review => (
                                <li key={review.reviewId || review.id} className="review-item">
                                    <p><strong>{review.userUsername || 'User'}</strong> rated it: {review.rating}/5</p>
                                    <p>{review.comment}</p>
                                    <small>Reviewed on: {new Date(review.createdAt || review.created_at).toLocaleDateString()}</small>
                                    {isAuthenticated && user && (review.userId === user.id || review.user_id === user.id) && !editingReview && (
                                        <div className="review-actions">
                                            <button onClick={() => setEditingReview(review)} className="edit-review-button">Edit</button>
                                            <button onClick={() => handleDeleteReview(review.reviewId || review.id)} className="delete-review-button">Delete</button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        !editingReview && <p>No reviews yet. Be the first to review!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MovieDetailPage;