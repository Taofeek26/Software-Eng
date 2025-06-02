// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, logoutUser } = require('../controllers/authController'); // Add logoutUser
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser); // No protect middleware needed, client clears token
// router.get('/me', protect, getMe); // This is moved to userRoutes
module.exports = router;