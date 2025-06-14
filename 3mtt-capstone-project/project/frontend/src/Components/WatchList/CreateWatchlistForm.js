// src/components/Watchlist/CreateWatchlistForm.js
import React, { useState } from 'react';
import { createWatchlist } from '../../Services/apiService'; // Adjust the import path as necessary
import './WatchlistForm.css'; // Create this

const CreateWatchlistForm = ({ onWatchlistCreated }) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Watchlist name cannot be empty.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await createWatchlist({ name });
            onWatchlistCreated(response.data); // Pass new watchlist to parent
            setName(''); // Clear form
        } catch (err) {
            console.error("Error creating watchlist:", err);
            setError(err.response?.data?.message || "Failed to create watchlist.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="watchlist-form">
            <h4>Create New Watchlist</h4>
            {error && <p className="error-message small-error">{error}</p>}
            <div className="form-group-inline">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Watchlist Name (e.g., Sci-Fi Classics)"
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create'}
                </button>
            </div>
        </form>
    );
};

export default CreateWatchlistForm;