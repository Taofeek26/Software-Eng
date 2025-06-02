// backend/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Optional: SSL configuration for cloud databases like Heroku, AWS RDS
    // ssl: {
    //   rejectUnauthorized: false // Adjust based on your provider's requirements
    // }
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL database!');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool, // Export pool if you need to manage transactions manually
};