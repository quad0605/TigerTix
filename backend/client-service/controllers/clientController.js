
// backend/client-service/controllers/clientController.js

const { listEvents, purchaseTicket } = require("../models/clientModel");


async function getAllEvents(req, res) {
  try {
    const events = await listEvents();
    return res.status(200).json(events);
  } catch (err) {
    console.error("[ClientController:getAllEvents]", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

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
