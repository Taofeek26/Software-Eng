// src/components/Movie/MovieCard.js (Partial - Add Favorite Button)
import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../Contexts/AuthContext';
import { addFavorite, removeFavorite, getCurrentUserProfile } from '../../Services/apiService'; // Assuming profile data not always fresh for favorites list
import './MovieCard.css';
import AddToWatchlistModal from '../WatchList/AddToWatchlistModal'; // Corrected import


const MovieCard = ({ movie }) => {
    const { isAuthenticated, user, login: updateUserInContext } = useContext(AuthContext); // login can be used to refresh user data in context
    const [isFavorite, setIsFavorite] = useState(false);
    const [processingFavorite, setProcessingFavorite] = useState(false);
    const [showWatchlistModal, setShowWatchlistModal] = useState(false);

    // Check if movie is a favorite when component mounts or user's favorites change
    useEffect(() => {
        if (isAuthenticated && user && user.favorites) {
            setIsFavorite(user.favorites.some(fav => fav.tmdbMovieId === movie.id));
        } else {
            setIsFavorite(false);
        }
    }, [isAuthenticated, user, movie.id]);

    const handleToggleFavorite = async (e) => {
        e.preventDefault(); // Prevent link navigation if button is inside Link
        e.stopPropagation();

        if (!isAuthenticated) {
            alert("Please log in to favorite movies.");
            // Or navigate to login: navigate('/login');
            return;
        }
        setProcessingFavorite(true);
        try {
            if (isFavorite) {
                await removeFavorite(movie.id);
                setIsFavorite(false);
            } else {
                await addFavorite({
                    tmdbMovieId: movie.id,
                    title: movie.title,
                    posterPath: movie.poster_path
                });
                setIsFavorite(true);
            }
            // Refresh user data in context to update favorites list globally
            const profileResponse = await getCurrentUserProfile();
            updateUserInContext(localStorage.getItem('token'), profileResponse.data);

        } catch (error) {
            console.error("Error toggling favorite:", error);
            alert("Could not update favorite status. Please try again.");
        } finally {
            setProcessingFavorite(false);
        }
    };

    const posterBaseUrl = 'https://image.tmdb.org/t/p/w500';
    const placeholderImage = 'https://via.placeholder.com/500x750?text=No+Image';

    return (
        <div className="movie-card">
            <Link to={`/movie/${movie.id}`}>
                <img /* ... */ />
                <div className="movie-info">
                    <h3 className="movie-title">{movie.title}</h3>
                    <p className="movie-rating">Rating: {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</p>
                </div>
            </Link>
            {isAuthenticated && (
                <button
                    onClick={handleToggleFavorite}
                    className={`favorite-button ${isFavorite ? 'favorited' : ''}`}
                    disabled={processingFavorite}
                >
                    {processingFavorite ? '...' : (isFavorite ? '❤️ Unfavorite' : '🤍 Favorite')}
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
    );
};
export default MovieCard;