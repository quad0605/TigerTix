//backend/user-authentication/routes/protectedRoutes.js
const express = require('express');
const router = express.Router();
const jwtMiddleware = require('../middleware/authMiddleware');

// Example protected route(s) that other services (like booking) will call or that frontend will call
router.get('/profile', jwtMiddleware, (req, res) => {
  // Example minimal payload: front-end can show "Logged in as <email>"
  res.json({
    message: 'protected_profile',
    user: {
      id: req.userId,
      email: req.userEmail
    }
  });
});

// An example booking-protected route (assumes you will integrate with your booking service)
router.post('/booking-action', jwtMiddleware, (req, res) => {
  // Here you would call booking service or forward request; for now return stub:
  res.json({ message: 'booking_action_allowed', userId: req.userId });
});

module.exports = router;
