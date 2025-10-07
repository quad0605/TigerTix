const express = require('express');
const router = express.Router();
const { postCreateEvent } = require('../controllers/adminController');

// POST /api/admin/events
router.post('/events', postCreateEvent);

module.exports = router;
