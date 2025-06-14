*   **Frontend:** Netlify / Vercel
    *   Connect GitHub repository for continuous deployment.
    *   Configure build settings.
    *   Set up environment variables (e.g., `REACT_APP_API_BASE_URL`).
*   **Backend:** Render / Heroku
    *   Containerize with Docker (recommended for Render/Heroku) or use buildpacks.
    *   Connect GitHub repository.
    *   Configure environment variables (e.g., `DATABASE_URL`, `JWT_SECRET`, `TMDB_API_KEY`, `PORT`, `CLIENT_ORIGIN` for CORS).
*   **Database:** MongoDB Atlas (already cloud-based). Ensure IP whitelisting allows access from backend deployment service.
*   **CI/CD:** GitHub Actions (or similar) to automate builds, tests, and deployments.