# Movie App - Full Stack Application

A modern full-stack movie application built with React and Node.js, featuring user authentication, movie search, reviews, favorites, and watchlists.

## Features

### Core Features
- **Movie Discovery**: Browse popular movies and search by title
- **Movie Details**: View detailed information about movies including cast, crew, and synopsis
- **User Authentication**: Secure registration and login system
- **User Profiles**: Manage personal information and view activity

### Advanced Features
- **Movie Reviews**: Rate and review movies with detailed comments
- **Favorites**: Add movies to your personal favorites list
- **Watchlists**: Create and manage custom watchlists
- **Responsive Design**: Optimized for desktop and mobile devices

## Tech Stack

### Frontend
- **React 19**: Modern React with latest features
- **React Router**: Client-side routing
- **Axios**: HTTP client for API requests
- **CSS3**: Custom styling with responsive design

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **PostgreSQL**: Database for data persistence
- **JWT**: Authentication tokens
- **bcrypt**: Password hashing
- **TMDB API**: Movie data source

## Project Structure

```
project/
├── backend/
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── controllers/
│   │   ├── authController.js   # Authentication logic
│   │   ├── movieController.js  # Movie operations
│   │   ├── userController.js   # User management
│   │   ├── reviewController.js # Review operations
│   │   └── ...
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT authentication
│   ├── models/
│   │   ├── User_Schema.sql     # User database schema
│   │   ├── App_Schema.sql      # Application database schema
│   │   └── App_Features_Schema.sql
│   ├── routes/
│   │   ├── authRoutes.js       # Authentication routes
│   │   ├── movieRoutes.js      # Movie routes
│   │   └── ...
│   ├── services/
│   │   └── tmdbService.js      # TMDB API integration
│   ├── .env.example           # Environment variables template
│   ├── package.json
│   ├── render.yaml            # Render deployment config
│   └── server.js              # Express server entry point
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── Components/
│   │   │   ├── Auth/           # Authentication components
│   │   │   ├── Layout/         # Layout components
│   │   │   ├── Movies/         # Movie-related components
│   │   │   ├── Review/         # Review components
│   │   │   └── WatchList/      # Watchlist components
│   │   ├── Contexts/
│   │   │   └── AuthContext.js  # Authentication context
│   │   ├── Pages/
│   │   │   ├── HomePage.js     # Main page
│   │   │   ├── MovieDetailPage.js
│   │   │   ├── ProfilePage.js
│   │   │   └── ...
│   │   ├── Services/
│   │   │   └── apiService.js   # API service layer
│   │   └── App.js
│   ├── .env.example           # Environment variables template
│   ├── package.json
│   └── vercel.json            # Vercel deployment config
├── DEPLOYMENT.md              # Deployment instructions
└── README.md                  # This file
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- TMDB API key (get from themoviedb.org)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Copy environment template and configure
   cp .env.example .env
   # Edit .env with your database URL, JWT secret, and TMDB API key
   ```

3. **Database Setup**
   ```bash
   # Create PostgreSQL database and run schema files in order:
   # 1. models/User_Schema.sql
   # 2. models/App_Schema.sql  
   # 3. models/App_Features_Schema.sql
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   
   # Copy environment template and configure
   cp .env.example .env
   # Edit .env with your backend API URL
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

## Environment Variables

### Backend (.env)
```
PORT=5001
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/movie_app_db
JWT_SECRET=your-super-secure-jwt-secret-key
TMDB_API_KEY=your-tmdb-api-key
BCRYPT_ROUNDS=12
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5001/api
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Movies
- `GET /api/movies/popular` - Get popular movies
- `GET /api/movies/search?query=` - Search movies
- `GET /api/movies/:tmdbId` - Get movie details
- `GET /api/movies/:tmdbId/reviews` - Get movie reviews
- `POST /api/movies/:tmdbId/reviews` - Add movie review

### User
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `GET /api/users/me/favorites` - Get user favorites
- `POST /api/users/me/favorites` - Add to favorites
- `DELETE /api/users/me/favorites/:tmdbId` - Remove from favorites

### Watchlists
- `GET /api/users/me/watchlists` - Get user watchlists
- `POST /api/users/me/watchlists` - Create watchlist
- `DELETE /api/users/me/watchlists/:id` - Delete watchlist
- `POST /api/users/me/watchlists/:id/movies` - Add movie to watchlist
- `DELETE /api/users/me/watchlists/:id/movies/:tmdbId` - Remove movie from watchlist

## Security Features

- **Password Hashing**: bcrypt with configurable rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Environment Variables**: Sensitive data stored securely
- **Security Headers**: X-Content-Type-Options, X-Frame-Options, etc.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for:
- Backend deployment to Render
- Frontend deployment to Vercel
- Database setup and configuration
- Environment variable configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For issues and questions:
1. Check the troubleshooting section in DEPLOYMENT.md
2. Review the API documentation above
3. Check the browser console for frontend issues
4. Check server logs for backend issues