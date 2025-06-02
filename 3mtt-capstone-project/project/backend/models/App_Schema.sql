-- Ensure uuid-ossp extension is enabled (usually done once per database)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Already in User_Schema.sql, so likely exists

-- ---
-- Table: reviews
-- Purpose: Stores user reviews and ratings for movies.
-- ---
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Foreign key to users table
    tmdb_movie_id INTEGER NOT NULL, -- Storing TMDB's integer movie ID
    rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- Example: 1-5 star rating. Adjust as needed (e.g., 1-10). Can be NULL if review only has text.
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, tmdb_movie_id) -- A user can typically review a specific movie only once
);

-- ---
-- Table: genres (Optional, but can be useful for local lookups)
-- Purpose: Stores movie genre information, potentially synced from TMDB.
-- ---
CREATE TABLE genres (
    id INTEGER PRIMARY KEY, -- Using TMDB's genre ID directly as the primary key
    name VARCHAR(100) UNIQUE NOT NULL
    -- No created_at/updated_at needed if this is just reference data from TMDB
);

-- ---
-- Table: favorites (Renamed/repurposed from watchlist_items)
-- Purpose: Stores movies that users have marked as favorites (a single list per user).
-- ---
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tmdb_movie_id INTEGER NOT NULL,
    title VARCHAR(255), -- Storing for convenience, though can be fetched from TMDB
    poster_path VARCHAR(255), -- Storing for convenience
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, tmdb_movie_id)
);

-- ---
-- Table: watchlists
-- Purpose: Stores user-created named watchlists.
-- ---
CREATE TABLE watchlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    -- Constraint to ensure a user's watchlist names are unique (optional but good)
    -- UNIQUE (user_id, name)
);

-- ---
-- Table: watchlist_movies
-- Purpose: Join table linking movies (by tmdb_movie_id) to specific watchlists.
-- ---
CREATE TABLE watchlist_movies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    watchlist_id UUID NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
    tmdb_movie_id INTEGER NOT NULL,
    title VARCHAR(255), -- Storing for convenience
    poster_path VARCHAR(255), -- Storing for convenience
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (watchlist_id, tmdb_movie_id) -- A movie can be in a specific watchlist only once
);

-- ---
-- Triggers for updated_at timestamps
-- ---
-- (Assuming update_updated_at_column() function already exists from previous schemas)

-- Trigger for 'watchlists' table
CREATE TRIGGER update_watchlists_updated_at
BEFORE UPDATE ON watchlists
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- No triggers needed for 'favorites' or 'watchlist_movies' unless they have other updatable fields.
-- ---
-- Triggers for updated_at timestamps (if you haven't created this function globally)
-- You might have already created this function when setting up the 'users' table.
-- If so, you only need the CREATE TRIGGER statements.
-- ---

-- Re-usable function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for 'reviews' table
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Note: watchlist_items typically doesn't need an updated_at trigger,
-- as items are usually just added or removed. If you add more modifiable fields
-- to watchlist_items later, you might consider adding a trigger for it.

-- Note: 'genres' table doesn't need an updated_at trigger if it's just reference data.