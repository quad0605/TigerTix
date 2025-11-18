const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");
const authMiddleware = require("../../user-authentication/middleware/authMiddleware");

// GET all events
router.get("/events", clientController.getAllEvents);

// POST purchase ticket
router.post("/events/:id/purchase", authMiddleware, clientController.purchaseTicket);

module.exports = router;
