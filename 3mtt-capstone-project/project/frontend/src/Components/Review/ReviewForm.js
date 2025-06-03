// src/components/Review/ReviewForm.js
import React, { useState } from 'react';
import { postReview, updateReview } from '../../Serivices/apiService'; // Adjust the import path as needed
import './ReviewForm.css'; // Create this

const ReviewForm = ({ tmdbMovieId, existingReview, onReviewSubmitted, onCancelEdit }) => {
    const [rating, setRating] = useState(existingReview?.rating || '');
    const [comment, setComment] = useState(existingReview?.comment || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating) {
            setError("Rating is required.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const reviewData = { rating: parseInt(rating), comment };
            let response;
            if (existingReview && existingReview.reviewId) {
                // Editing: updateReview uses existingReview.tmdbMovieId internally or reviewId
            } else { // Creating new
                response = await postReview(tmdbMovieId, reviewData); // tmdbMovieId prop is used here
            }
            onReviewSubmitted(response.data); // Pass new/updated review to parent
            if (!existingReview) { // Clear form only if it was a new review
                setRating('');
                setComment('');
            }
        } catch (err) {
            console.error("Error submitting review:", err);
            setError(err.response?.data?.message || "Failed to submit review.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="review-form">
            <h4>{existingReview ? 'Edit Your Review' : 'Write a Review'}</h4>
            {error && <p className="error-message small-error">{error}</p>}
            <div className="form-group">
                <label htmlFor="rating">Rating (1-5):</label>
                <select id="rating" value={rating} onChange={(e) => setRating(e.target.value)} required>
                    <option value="" disabled>Select rating</option>
                    {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="comment">Comment:</label>
                <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows="4"
                    placeholder="Share your thoughts..."
                />
            </div>
            <div className="form-actions">
                <button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : (existingReview ? 'Update Review' : 'Submit Review')}
                </button>
                {existingReview && onCancelEdit && (
                    <button type="button" onClick={onCancelEdit} className="cancel-button">
                        Cancel Edit
                    </button>
                )}
            </div>
        </form>
    );
};

export default ReviewForm;