// backend/llm-driven-booking/routes/llmRoute.js
const express = require("express");
const router = express.Router();
const { parseUserInput, confirmBooking, handleChat } = require("../controllers/llmController");

router.post("/parse", parseUserInput);
router.post("/confirm", confirmBooking);
router.post("/chat", handleChat);
module.exports = router;
