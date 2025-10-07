const { createEvent, getAllEvents } = require('../models/adminModel');

function isValidISODate(s) {
  return !isNaN(Date.parse(s));
}

async function postCreateEvent(req, res, next) {
  try {
    const { name, date, tickets_total } = req.body;

    // Validation (rubric 1.1 + 1.3)
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'name is required (non-empty string)' });
    }
    if (!isValidISODate(date)) {
      return res.status(400).json({ error: 'date must be a valid ISO datetime string' });
    }
    const total = Number(tickets_total);
    if (!Number.isInteger(total) || total < 0) {
      return res.status(400).json({ error: 'tickets_total must be an integer >= 0' });
    }

    const event = await createEvent({ name: name.trim(), date, tickets_total: total });
    return res.status(201).json(event);
  } catch (err) {
    next(err); // 500 handler in server.js
  }
}

module.exports = { postCreateEvent };
