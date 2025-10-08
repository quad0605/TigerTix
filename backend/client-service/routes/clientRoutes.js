const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");

// GET all events
router.get("/events", clientController.getAllEvents);

// POST purchase ticket
router.post("/events/:id/purchase", clientController.purchaseTicket);

module.exports = router;
