*   **User Model:**
    *   `username` (String, required, unique)
    *   `email` (String, required, unique)
    *   `passwordHash` (String, required)
    *   `createdAt` (Date, default: Date.now)
    *   `updatedAt` (Date, default: Date.now)
    *   `favorites`: [ { `tmdbMovieId`: Number, `title`: String, `posterPath`: String, `addedAt`: Date } ] (Could be separate collection for scalability)
    *   `watchlists`: [ { `name`: String, `movies`: [ { `tmdbMovieId`: Number, `title`: String, `posterPath`: String, `addedAt`: Date } ] } ] (Definitely better as a separate collection)

*   **MovieFavorite Model (if separating):**
    *   `userId` (ObjectId, ref: 'User', required)
    *   `tmdbMovieId` (Number, required)
    *   `title` (String)
    *   `posterPath` (String)
    *   `addedAt` (Date, default: Date.now)
    *   *(Index on `userId` and `tmdbMovieId`)*

*   **Watchlist Model (if separating):**
    *   `userId` (ObjectId, ref: 'User', required)
    *   `name` (String, required, default: 'My Watchlist')
    *   `createdAt` (Date, default: Date.now)
    *   `updatedAt` (Date, default: Date.now)
    *   *(Index on `userId`)*

*   **WatchlistMovieItem Model (links movies to watchlists):**
    *   `watchlistId` (ObjectId, ref: 'Watchlist', required)
    *   `tmdbMovieId` (Number, required)
    *   `title` (String)
    *   `posterPath` (String)
    *   `addedAt` (Date, default: Date.now)
    *   *(Index on `watchlistId` and `tmdbMovieId`)*

*   **Review Model:**
    *   `userId` (ObjectId, ref: 'User', required)
    *   `tmdbMovieId` (Number, required)
    *   `rating` (Number, required, min: 1, max: 5 or 10)
    *   `comment` (String, optional)
    *   `createdAt` (Date, default: Date.now)
    *   `updatedAt` (Date, default: Date.now)
    *   *(Index on `userId` and `tmdbMovieId`, and `tmdbMovieId` alone for fetching all reviews for a movie)*