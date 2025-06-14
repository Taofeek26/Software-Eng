// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { getPopularMovies } from '../Services/apiService';
import MovieCard from '../Components/Movies/MovieCard'; // We'll create this
import './HomePage.css';

const HomePage = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            try {
                const response = await getPopularMovies(page);
                // Assuming TMDB structure: response.data.results
                setMovies(prevMovies => page === 1 ? response.data.results : [...prevMovies, ...response.data.results]);
                setHasMore(response.data.page < response.data.total_pages);
                setError(null);
            } catch (err) {
                console.error("Error fetching popular movies:", err);
                setError(err.response?.data?.message || err.message || 'Failed to fetch movies');
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();
    }, [page]);

    const loadMoreMovies = () => {
        setPage(prevPage => prevPage + 1);
    }

    return (
        <div className="homepage">
            <h1>Popular Movies</h1>
            {error && <p className="error-message">Error: {error}</p>}
            <div className="movie-grid">
                {movies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                ))}
            </div>
            {loading && <p>Loading...</p>}
            {!loading && hasMore && (
                <button onClick={loadMoreMovies} className="load-more-button">Load More</button>
            )}
            {!hasMore && <p>No more movies to load.</p>}
        </div>
    );
};

export default HomePage;