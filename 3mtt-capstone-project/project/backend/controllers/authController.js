// backend/controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Register User
exports.registerUser = async (req, res) => {
    // Destructure all expected fields from the request body
    const { username, firstname, lastname, email, password } = req.body;

    // Validate all required fields
    if (!username || !firstname || !lastname || !email || !password) {
        return res.status(400).json({ message: 'Please provide username, firstname, lastname, email, and password' });
    }

    try {
        // Check if user already exists
        const userExists = await db.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User with this email or username already exists' });
        }

        // Hash password with stronger rounds
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Insert new user -  UPDATE THIS QUERY
        const newUserResult = await db.query(
            'INSERT INTO users (username, firstname, lastname, email, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, firstname, lastname, email, created_at',
            [username, firstname, lastname, email, password_hash] // Add firstname and lastname here
        );
        const newUser = newUserResult.rows[0];

        // Create JWT
        const token = jwt.sign({ userId: newUser.id, username: newUser.username }, JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                firstname: newUser.firstname, // Include in response
                lastname: newUser.lastname,   // Include in response
                email: newUser.email,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        // Send the actual database error message during development for easier debugging
        // For production, you might want a more generic message
        if (error.code === '23502') { // Specific error for not-null violation
             return res.status(400).json({ message: `Missing required field: ${error.column} cannot be null.` });
        }
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
};

// Login User (ensure it also returns firstname and lastname if needed)
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    try {
        // Find user by email
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const user = userResult.rows[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create JWT
        const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(200).json({
            message: 'Login successful',
            token,
            user: { // Make sure to return all desired user fields
                id: user.id,
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Get Logged in User (ensure it also returns firstname and lastname)
exports.getMe = async (req, res) => {
    try {
        // Adjust the SELECT query to include all desired fields
        const userResult = await db.query('SELECT id, username, firstname, lastname, email, created_at FROM users WHERE id = $1', [req.user.userId]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(userResult.rows[0]);
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ... existing code ...

// Logout User (Conceptual - JWTs are stateless)
exports.logoutUser = (req, res) => {
    // For stateless JWTs, logout is typically handled client-side by deleting the token.
    // If you implement a token blacklist on the server, you would add the token to the blacklist here.
    // For now, we'll just send a success message.
    res.status(200).json({ message: 'Logout successful. Please clear your token client-side.' });
};