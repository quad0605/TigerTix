const express = require('express');
const router = express.Router();
const { postCreateEvent } = require('../controllers/adminController');

// listens for post requests to /events
// full path is /api/admin/events
router.post('/events', postCreateEvent);

module.exports = router;
