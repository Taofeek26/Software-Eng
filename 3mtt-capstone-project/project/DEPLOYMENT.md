# Movie App Deployment Guide

This guide covers deploying the Movie App backend to Render and frontend to Vercel.

## Prerequisites

- GitHub account
- Render account (render.com)
- Vercel account (vercel.com)
- TMDB API key (themoviedb.org)

## Backend Deployment (Render)

### 1. Database Setup

1. **Create PostgreSQL Database on Render:**
   - Go to Render Dashboard
   - Click "New" → "PostgreSQL"
   - Database Name: `movie_app_db`
   - User: `movie_app_user`
   - Region: Choose closest to your users
   - PostgreSQL Version: 15 (recommended)
   - Plan: Free tier available

2. **Run Database Schema:**
   ```sql
   -- Execute the SQL files in this order:
   -- 1. backend/models/User_Schema.sql
   -- 2. backend/models/App_Schema.sql
   -- 3. backend/models/App_Features_Schema.sql
   ```

### 2. Backend Service Setup

1. **Create Web Service on Render:**
   - Go to Render Dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing your movie app
   - Configuration:
     - **Name:** `movie-app-backend`
     - **Region:** Same as your database
     - **Branch:** `main` or `dev`
     - **Root Directory:** `backend`
     - **Runtime:** `Node`
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`

2. **Environment Variables:**
   Set the following environment variables in Render:
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=[Auto-generated from your Render PostgreSQL database]
   JWT_SECRET=[Generate a secure 32+ character string]
   TMDB_API_KEY=[Your TMDB API key]
   BCRYPT_ROUNDS=12
   ```

3. **Auto-Deploy:**
   - Enable auto-deploy from your GitHub branch
   - Service will rebuild on every push to the selected branch

### 3. Backend Security Notes

- JWT_SECRET should be a strong, randomly generated string
- Database credentials are automatically managed by Render
- SSL is enabled by default for PostgreSQL connections
- CORS is configured to allow your frontend domain

## Frontend Deployment (Vercel)

### 1. Environment Setup

1. **Update Environment Variables:**
   - Create `.env.production` file:
   ```
   REACT_APP_API_URL=https://your-backend-app.onrender.com/api
   ```
   - Replace `your-backend-app` with your actual Render service name

2. **Update CORS in Backend:**
   Update `backend/server.js` CORS configuration:
   ```javascript
   app.use(cors({
       origin: process.env.NODE_ENV === 'production' 
           ? ['https://your-frontend-app.vercel.app'] 
           : ['http://localhost:3000', 'http://127.0.0.1:3000'],
       credentials: true
   }));
   ```

### 2. Vercel Deployment

1. **Deploy via Vercel CLI:**
   ```bash
   cd frontend
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Deploy via Vercel Dashboard:**
   - Go to vercel.com/dashboard
   - Click "New Project"
   - Import your GitHub repository
   - Configuration:
     - **Project Name:** `movie-app-frontend`
     - **Framework Preset:** `Create React App`
     - **Root Directory:** `frontend`
     - **Build Command:** `npm run build`
     - **Output Directory:** `build`

3. **Environment Variables in Vercel:**
   ```
   REACT_APP_API_URL=https://your-backend-app.onrender.com/api
   ```

### 3. Custom Domain (Optional)

1. **Add Custom Domain in Vercel:**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

2. **Update CORS in Backend:**
   - Add your custom domain to the CORS whitelist

## Database Schema Setup

Execute these SQL files in order on your Render PostgreSQL database:

### 1. User Schema
```sql
-- From backend/models/User_Schema.sql
-- Creates users table with authentication fields
```

### 2. App Schema
```sql
-- From backend/models/App_Schema.sql
-- Creates movies, reviews, and related tables
```

### 3. App Features Schema
```sql
-- From backend/models/App_Features_Schema.sql
-- Creates favorites, watchlists, and advanced features
```

## Environment Variables Summary

### Backend (.env)
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secure-jwt-secret-key
TMDB_API_KEY=your-tmdb-api-key
BCRYPT_ROUNDS=12
```

### Frontend (.env)
```
REACT_APP_API_URL=https://your-backend-app.onrender.com/api
```

## Post-Deployment Checklist

### Backend Verification
- [ ] Service starts without errors
- [ ] Database connection successful
- [ ] API endpoints respond correctly
- [ ] Authentication works
- [ ] CORS headers are set correctly

### Frontend Verification
- [ ] App loads without errors
- [ ] API calls work correctly
- [ ] Authentication flow works
- [ ] All pages render properly
- [ ] Mobile responsive design works

### Security Verification
- [ ] Environment variables are properly set
- [ ] No sensitive data in repository
- [ ] HTTPS enforced on both services
- [ ] CORS properly configured
- [ ] Database access restricted

## Troubleshooting

### Common Backend Issues

1. **Database Connection Errors:**
   - Verify DATABASE_URL is correct
   - Check database is running and accessible
   - Ensure SSL configuration is correct

2. **Port Issues:**
   - Render automatically assigns PORT environment variable
   - Ensure your app uses `process.env.PORT`

3. **Build Failures:**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check build logs for specific errors

### Common Frontend Issues

1. **API Connection Issues:**
   - Verify REACT_APP_API_URL is correct
   - Check network tab for failed requests
   - Ensure backend CORS allows frontend domain

2. **Build Failures:**
   - Check for unused imports
   - Verify all dependencies are installed
   - Check for TypeScript errors if applicable

3. **Routing Issues:**
   - Ensure vercel.json is properly configured
   - Check for client-side routing conflicts

## Monitoring and Maintenance

### Backend Monitoring
- Monitor logs in Render dashboard
- Set up error tracking (optional: Sentry)
- Monitor database performance
- Regular security updates

### Frontend Monitoring
- Monitor deployment logs in Vercel
- Check Core Web Vitals
- Monitor API response times
- Regular dependency updates

## Support

For deployment issues:
- Check service logs in respective dashboards
- Verify environment variables are set correctly
- Ensure all dependencies are properly installed
- Check CORS configuration for cross-origin issues

## Cost Information

### Render (Backend)
- Free tier: 750 hours/month
- Paid plans start at $7/month
- PostgreSQL: Free tier available

### Vercel (Frontend)
- Free tier: Unlimited personal projects
- Pro plan: $20/month for teams
- Custom domains included

Both platforms offer generous free tiers suitable for development and small applications.