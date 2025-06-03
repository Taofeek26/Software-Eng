// src/components/Watchlist/AddToWatchlistModal.js
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../Contexts/AuthContext';
import { addMovieToWatchlist, getCurrentUserProfile } from '../../Serivices/apiService';
import './AddToWatchlistModal.css'; // Create this

const AddToWatchlistModal = ({ movie, onClose }) => {
    const { user, login: updateUserInContext } = useContext(AuthContext);
    const [selectedWatchlistId, setSelectedWatchlistId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Pre-select first watchlist if available
        if (user && user.watchlists && user.watchlists.length > 0) {
            setSelectedWatchlistId(user.watchlists[0].id);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedWatchlistId) {
            setError("Please select a watchlist.");
            return;
        }
        setLoading(true);
        setError('');
        try {
            await addMovieToWatchlist(selectedWatchlistId, {
                tmdbMovieId: movie.id,
                title: movie.title,
                posterPath: movie.poster_path
            });
            // Refresh user data in context to update watchlists
            const profileResponse = await getCurrentUserProfile();
            updateUserInContext(localStorage.getItem('token'), profileResponse.data);
            onClose(true); // Signal success
        } catch (err) {
            console.error("Error adding to watchlist:", err);
            setError(err.response?.data?.message || "Failed to add movie.");
        } finally {
            setLoading(false);
        }
    };

    if (!user || !user.watchlists || user.watchlists.length === 0) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <button className="modal-close-button" onClick={onClose}>×</button>
                    <h4>Add to Watchlist</h4>
                    <p>You don't have any watchlists. Please create one on your profile page first.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose}>×</button>
                <h4>Add "{movie.title}" to Watchlist</h4>
                {error && <p className="error-message small-error">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <select
                        value={selectedWatchlistId}
                        onChange={(e) => setSelectedWatchlistId(e.target.value)}
                        required
                    >
                        <option value="" disabled>Select a watchlist</option>
                        {user.watchlists.map(wl => (
                            <option key={wl.id} value={wl.id}>{wl.name}</option>
                        ))}
                    </select>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Adding...' : 'Add to Watchlist'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddToWatchlistModal;