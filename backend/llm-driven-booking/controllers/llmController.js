// backend/llm-driven-booking/controllers/llmController.js
require("dotenv").config();
const OpenAI = require("openai");
const { getDb } = require("../models/llmModel");

// Initialize OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/llm/parse
 * Body: { "text": "book 3 tickets for Jazz Night" }
 * Description: Uses GPT to extract event name and ticket count.
 */
async function parseUserInput(req, res) {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Missing text input" });

    // Build natural-language instruction for GPT
    const prompt = `
You are a booking assistant for an event ticketing system.
Given this user message, extract:
- event name
- number of tickets (default to 1 if not stated)
Return a valid JSON object only, like:
{ "event": "Event Name", "tickets": 2 }

User message: "${text}"
`;

    // Call the GPT model 
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
    });

    // Extract GPT text output and parse it into JSON
    const output = response.output[0].content[0].text;
    let parsed;
    try {
      parsed = JSON.parse(output);
    } catch {
      parsed = { event: "unknown", tickets: 1 };
    }

    // Lookup event in the database
    const db = getDb();
    db.get(
      `SELECT * FROM events WHERE LOWER(name) = LOWER(?)`,
      [parsed.event],
      (err, row) => {
        db.close();
        if (err) return res.status(500).json({ error: "Database lookup error" });
        res.json({ parsed, match: row || null });
      }
    );
  } catch (err) {
    console.error("Error in parseUserInput:", err);
    res.status(500).json({ error: "Failed to interpret user input" });
  }
}

/**
 * POST /api/llm/confirm
 * Body: { "event": "Jazz Night", "tickets": 2 }
 * Description: Updates tickets_available for the given event.
 */
function confirmBooking(req, res) {
  const { event, tickets } = req.body || {};
  const qty = Number(tickets);

  if (!event || !String(event).trim())
    return res.status(400).json({ error: "Missing 'event' field." });
  if (!Number.isInteger(qty) || qty <= 0)
    return res.status(400).json({ error: "'tickets' must be a positive integer." });

  const db = getDb();
  db.get(
    `SELECT id, name, tickets_total, tickets_sold FROM events WHERE LOWER(name) = LOWER(?)`,
    [event],
    (err, ev) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: "DB lookup error" });
      }
      if (!ev) {
        db.close();
        return res.status(404).json({ error: "Event not found" });
      }
      const available = ev.tickets_total - ev.tickets_sold;
      if (available < qty) {
        db.close();
        return res.status(409).json({ error: "Not enough tickets available", available: available });
      }

      // Atomic update
      db.run(
        `UPDATE events
           SET tickets_sold = tickets_sold + ?
         WHERE id = ? AND (tickets_total - tickets_sold) >= ?`,
        [qty, ev.id, qty],
        function (updateErr) {
          if (updateErr) {
            db.close();
            return res.status(500).json({ error: "Error updating ticket count" });
          }

          db.get(`SELECT * FROM events WHERE id = ?`, [ev.id], (selErr, updated) => {
            db.close();
            if (selErr)
              return res.status(500).json({ error: "Error fetching updated event" });
            res.json({
              message: `Successfully booked ${qty} ticket(s) for ${updated.name}.`,
              updated,
            });
          });
        }
      );
    }
  );
}

module.exports = { parseUserInput, confirmBooking };
