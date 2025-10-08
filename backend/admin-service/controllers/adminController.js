//import create event function from model
const { createEvent } = require('../models/adminModel');

//validates date input
function isValidISODate(s) {
  return !isNaN(Date.parse(s));
}

//handles post request, ensures fields are not empty, calls model to create event
async function postCreateEvent(req, res, next) {
  try {
    const { name, date, tickets_total } = req.body;

    //Validation strings and numbers not null or empty
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
  } 
  // 500 handler in server.js
  catch (err) {
    next(err); 
  }
}

module.exports = { postCreateEvent };
