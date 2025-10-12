//import create event function from model
const { createEvent, updateEvent } = require('../models/adminModel');

/**
 * Validate that a string is a parsable ISO datetime.
 * @param {string} s - Candidate date string.
 * @returns {boolean} True if s can be parsed as a Date.
 */
function isValidISODate(s) {
  return !isNaN(Date.parse(s));
}

/**
 * Handle POST /events - create a new event.
 * Validates request body (name, date, tickets_total) and delegates to createEvent.
 *
 * @param {import('express').Request} req - Express request (body: { name, date, tickets_total }).
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next for error handling.
 * @returns {Promise<void>} Sends HTTP response or calls next(err) on error.
 */
async function postCreateEvent(req, res, next) {
  try {
    const { name, date, tickets_total} = req.body;

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

/**
 * Handle POST /events - create a new event.
 * Validates request body (name, date, tickets_total) and delegates to createEvent.
 *
 * @param {import('express').Request} req - Express request (body: { name, date, tickets_total }).
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next for error handling.
 * @returns {Promise<void>} Sends HTTP response or calls next(err) on error.
 */
async function putUpdateEvent(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'id must be a positive integer' });
    }

    const { name, date, tickets_total } = req.body;
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

    const event = await updateEvent(id, { name: name.trim(), date, tickets_total: total });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    return res.status(200).json(event);
  } catch (err) {
    next(err);
  }
}

module.exports = { postCreateEvent, putUpdateEvent };

