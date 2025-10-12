// backend/admin-service/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { postCreateEvent, putUpdateEvent } = require('../controllers/adminController');

// full path is /api/admin/events
router.post('/events', postCreateEvent);
router.put('/events/:id', putUpdateEvent);

module.exports = router;