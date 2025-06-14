// src/pages/ProfilePage.js
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../Contexts/AuthContext';
import { updateUserProfile } from '../Services/apiService'; // You have this
import './ProfilePage.css';
import MovieCard from '../Components/Movies/MovieCard'; // For displaying favorites/reviews
import CreateWatchlistForm from '../Components/WatchList/CreateWatchlistForm'; // Import
import { /* other apiService functions, */ deleteWatchlist, removeMovieFromWatchlist, getCurrentUserProfile } from '../Services/apiService';

const ProfilePage = () => {
    const { user, token, login: updateUserContext } = useContext(AuthContext); // login updates context
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        username: '',
        firstname: '',
        lastname: '',
        email: ''
    });

    const handleWatchlistCreated = (newWatchlist) => {
        // Update profileData state to include the new watchlist
        setProfileData(prevData => ({
            ...prevData,
            watchlists: [...(prevData.watchlists || []), newWatchlist]
        }));
        // Also refresh the user in AuthContext
        refreshUserProfile();
    };

    const refreshUserProfile = async () => {
        try {
            const response = await getCurrentUserProfile();
            setProfileData(response.data);
            // login function from context updates both context state and localStorage
            updateUserContext(localStorage.getItem('token'), response.data);
        } catch (error) {
            console.error("Error refreshing profile data:", error);
        }
    };

    const handleDeleteWatchlist = async (watchlistId) => {
        if (window.confirm("Are you sure you want to delete this watchlist and all its movies?")) {
            try {
                await deleteWatchlist(watchlistId);
                refreshUserProfile(); // Refresh to show changes
            } catch (err) {
                console.error("Error deleting watchlist:", err);
                alert(err.response?.data?.message || "Failed to delete watchlist.");
            }
        }
    };

    const handleRemoveMovieFromUserWatchlist = async (watchlistId, tmdbMovieId) => {
        if (window.confirm("Are you sure you want to remove this movie from the watchlist?")) {
            try {
                await removeMovieFromWatchlist(watchlistId, tmdbMovieId);
                refreshUserProfile(); // Refresh to show changes
            } catch (err) {
                console.error("Error removing movie from watchlist:", err);
                alert(err.response?.data?.message || "Failed to remove movie.");
            }
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            if (token) {
                setLoading(true);
                try {
                    const response = await getCurrentUserProfile(); // Uses token from interceptor
                    setProfileData(response.data);
                    setEditFormData({
                        username: response.data.username || '',
                        firstname: response.data.firstname || '',
                        lastname: response.data.lastname || '',
                        email: response.data.email || '',
                    });
                    setError(null);
                } catch (err) {
                    console.error("Error fetching profile:", err);
                    setError(err.response?.data?.message || 'Failed to load profile');
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
                setError("Not authenticated.");
            }
        };
        fetchProfile();
    }, [token]);

    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await updateUserProfile(editFormData);
            setProfileData(response.data); // Update displayed profile
            updateUserContext(token, response.data); // Update user in AuthContext and localStorage
            setIsEditing(false);
            setError(null);
        } catch (err) {
            console.error("Error updating profile:", err);
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    
    if (loading && !profileData) return <p>Loading profile...</p>;
    if (error && !profileData) return <p className="error-message">Error: {error}</p>;
    if (!profileData) return <p>No profile data available. Please log in.</p>;


    return (
        <div className="profile-page">
            <h2>{profileData.username}'s Profile</h2>

            {isEditing ? (
                <form onSubmit={handleEditSubmit} className="profile-edit-form">
                    <h3>Edit Profile</h3>
                    {error && <p className="error-message">{error}</p>}
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input type="text" name="username" value={editFormData.username} onChange={handleEditChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="firstname">First Name:</label>
                        <input type="text" name="firstname" value={editFormData.firstname} onChange={handleEditChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="lastname">Last Name:</label>
                        <input type="text" name="lastname" value={editFormData.lastname} onChange={handleEditChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input type="email" name="email" value={editFormData.email} onChange={handleEditChange} required />
                    </div>
                    {/* Add password change fields separately if desired */}
                    <button type="submit" disabled={loading} className="save-button">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)} className="cancel-button">Cancel</button>
                </form>
            ) : (
                <div className="profile-details">
                    <p><strong>Username:</strong> {profileData.username}</p>
                    <p><strong>Name:</strong> {profileData.firstname} {profileData.lastname}</p>
                    <p><strong>Email:</strong> {profileData.email}</p>
                    <p><strong>Joined:</strong> {new Date(profileData.created_at).toLocaleDateString()}</p>
                    <button onClick={() => setIsEditing(true)} className="edit-profile-button">Edit Profile</button>
                </div>
            )}

            <section className="profile-section">
                <h3>My Favorite Movies</h3>
                {profileData.favorites && profileData.favorites.length > 0 ? (
                    <div className="movie-grid">
                        {profileData.favorites.map(fav => (
                            <MovieCard key={fav.tmdbMovieId} movie={{ id: fav.tmdbMovieId, title: fav.title, poster_path: fav.posterPath, vote_average: null /* Or fetch rating if needed */ }} />
                        ))}
                    </div>
                ) : <p>You haven't favorited any movies yet.</p>}
            </section>

            <section className="profile-section">
                <h3>My Watchlists</h3>
                <CreateWatchlistForm onWatchlistCreated={handleWatchlistCreated} />
                {profileData.watchlists && profileData.watchlists.length > 0 ? (
                    profileData.watchlists.map(watchlist => (
                        <div key={watchlist.id || watchlist.name} className="watchlist-item-profile">
                            <div className="watchlist-header">
                                <h4>{watchlist.name}</h4>
                                <button
                                    onClick={() => handleDeleteWatchlist(watchlist.id)}
                                    className="delete-button small-button"
                                >
                                    Delete Watchlist
                                </button>
                                {/* Add Rename Watchlist button/form here later if needed */}
                            </div>
                            {watchlist.movies && watchlist.movies.length > 0 ? (
                                <div className="movie-grid watchlist-movie-grid">
                                    {watchlist.movies.map(movie => (
                                        <div key={movie.tmdbMovieId} className="movie-card-wrapper-in-list">
                                            <MovieCard movie={{ id: movie.tmdbMovieId, title: movie.title, poster_path: movie.posterPath, vote_average: null }} />
                                            <button
                                                onClick={() => handleRemoveMovieFromUserWatchlist(watchlist.id, movie.tmdbMovieId)}
                                                className="remove-movie-button"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : <p>This watchlist is empty. Add some movies!</p>}
                        </div>
                    ))
                ) : <p>You haven't created any watchlists yet.</p>}
            </section>

            <section className="profile-section">
                <h3>My Reviews</h3>
                {profileData.reviews && profileData.reviews.length > 0 ? (
                     <ul className="reviews-list profile-reviews">
                        {profileData.reviews.map(review => (
                            <li key={review.reviewId} className="review-item">
                                <p><strong>Movie ID: {review.tmdbMovieId}</strong> (Link to movie later)</p>
                                <p>Rated: {review.rating}/5</p>
                                <p>Comment: {review.comment}</p>
                                <small>Reviewed on: {new Date(review.createdAt).toLocaleDateString()}</small>
                                {/* Add edit/delete buttons for review */}
                            </li>
                        ))}
                    </ul>
                ) : <p>You haven't reviewed any movies yet.</p>}
            </section>
        </div>
    );
};

export default ProfilePage;