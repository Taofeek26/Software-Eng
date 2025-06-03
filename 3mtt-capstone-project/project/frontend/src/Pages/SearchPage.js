// src/pages/SearchPage.js
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMovies } from '../Serivices/apiService'; // Adjust the import path as necessary
import MovieCard from '../Components/Movies/MovieCard'; // Adjust the import path as necessary
import './SearchPage.css';

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialQuery = searchParams.get('query') || '';

    const [searchTerm, setSearchTerm] = useState(initialQuery);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [searched, setSearched] = useState(!!initialQuery); // Track if a search has been performed

    const handleSearch = async (currentPage = 1, termToSearch = searchTerm) => {
        if (!termToSearch.trim()) {
            setResults([]);
            setSearched(false);
            setHasMore(false);
            return;
        }
        setLoading(true);
        setSearched(true);
        setSearchParams({ query: termToSearch }); // Update URL query param

        try {
            const response = await searchMovies(termToSearch, currentPage);
            setResults(prevResults => currentPage === 1 ? response.data.results : [...prevResults, ...response.data.results]);
            setHasMore(response.data.page < response.data.total_pages);
            setError(null);
        } catch (err) {
            console.error("Error searching movies:", err);
            setError(err.response?.data?.message || err.message || 'Failed to search movies');
            setResults([]);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Perform search if query param exists on initial load or when it changes
        const queryFromUrl = searchParams.get('query');
        if (queryFromUrl) {
            setSearchTerm(queryFromUrl); // Sync input field with URL
            setPage(1); // Reset page for new URL query
            handleSearch(1, queryFromUrl);
        } else {
            setResults([]); // Clear results if no query in URL
            setSearched(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams.get('query')]); // Only re-run if the 'query' search param changes


    const handleSubmit = (e) => {
        e.preventDefault();
        setPage(1); // Reset to page 1 for new search
        handleSearch(1);
    };

    const loadMoreResults = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        handleSearch(nextPage);
    }

    return (
        <div className="search-page">
            <h1>Search Movies</h1>
            <form onSubmit={handleSubmit} className="search-form">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for a movie..."
                    className="search-input"
                />
                <button type="submit" className="search-button" disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {error && <p className="error-message">Error: {error}</p>}

            {searched && !loading && results.length === 0 && (
                <p>No movies found for "{searchParams.get('query')}".</p>
            )}

            <div className="movie-grid">
                {results.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                ))}
            </div>

            {loading && page > 1 && <p>Loading more...</p>}
            {!loading && hasMore && results.length > 0 && (
                <button onClick={loadMoreResults} className="load-more-button">Load More</button>
            )}
        </div>
    );
};

export default SearchPage;