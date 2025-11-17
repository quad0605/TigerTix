//backend/user-authentication/routes/authRoutes.js
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const jwtMiddleware = require('../middleware/authMiddleware');

// Auth endpoints
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Current user
router.get('/me', jwtMiddleware, userController.getMe);

module.exports = router;
