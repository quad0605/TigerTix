
// backend/client-service/controllers/clientController.js

const { listEvents, purchaseTicket } = require("../models/clientModel");

/**
 * Handle GET /events
 * Lists all events available to clients.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<void>} Sends 200 with event array or 500 on error.
 */
async function getAllEvents(req, res) {
  try {
    const events = await listEvents();
    return res.status(200).json(events);
  } catch (err) {
    console.error("[ClientController:getAllEvents]", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * Handle POST /events/:id/purchase
 * Attempts to purchase a ticket for the event with the given id.
 *
 * @param {import('express').Request<{ id: string }>} req - params.id must be a positive integer
 * @param {import('express').Response} res
 * @returns {Promise<void>} 
 * Sends:
 *  - 200 with { message, event } on success
 *  - 400 for invalid id
 *  - 404 when event not found
 *  - 409 when event is sold out
 *  - 500 on server error
 */
async function purchaseTicketHandler(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "id must be a positive integer" });
    }

    const result = await purchaseTicket(id);

    if (result.status === "NOT_FOUND") {
      return res.status(404).json({ error: "Event not found" });
    }
    if (result.status === "SOLD_OUT") {
      return res.status(409).json({ error: "Event is sold out" });
    }

    return res.status(200).json({
      message: "Ticket purchased successfully",
      event: result.event,
    });
  } catch (err) {
    console.error("[ClientController:purchaseTicketHandler]", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  getAllEvents,
  purchaseTicket: purchaseTicketHandler,
};
