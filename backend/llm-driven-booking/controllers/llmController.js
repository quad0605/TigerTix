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

async function handleChat(req, res) {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Missing message" });

  const db = getDb();
  try {
    //  Fetch all available events
    const events = await new Promise((resolve, reject) => {
      db.all(`SELECT id, name, tickets_total, tickets_sold FROM events`, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const eventNames = events.map((e) => e.name);

    //  Give GPT all event names so it can reason and match properly
    const systemPrompt = `
You are a friendly event booking assistant.

You have access to this list of current events:
${eventNames.map((n, i) => `${i + 1}. ${n}`).join("\n")}

You must respond **only** in valid JSON:
{
  "action": "greet" | "list" | "parse" | "confirm",
  "data": { ...depends on action... },
  "reply": "natural language message to user"
}

Rules:
- "greet": if the user greets or makes small talk.
- "list": if the user asks to see available events.
- "parse": if the user wants to book tickets. Choose the best matching event name from the list (case-insensitive, partial matches allowed).
- "confirm": if the user explicitly confirms a booking (e.g. "yes, book it").
- Never return multiple actions in one reply.
`;

    const userPrompt = `
User: "${message}"
`;

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const text = response.output[0].content[0].text;
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.error("Invalid LLM output:", text);
      db.close();
      return res.json({ reply: "Sorry, I didn’t understand that." });
    }

    if (parsed.action === "greet") {
      db.close();
      return res.json({ reply: parsed.reply });
    }

    if (parsed.action === "list") {
      db.close();
      const listText = events
        .map((e) => {
          const available = e.tickets_total - e.tickets_sold;
          return `• ${e.name} (${available} available)`;
        })
        .join("\n");
      return res.json({
        reply: `${parsed.reply}\n\nHere are our current events:\n${listText}`,
      });
    }

    if (parsed.action === "parse") {
      const { event, tickets = 1 } = parsed.data || {};
      const matchedEvent = events.find(
        (e) => e.name.toLowerCase() === event.toLowerCase()
      ) ||
        events.find((e) => e.name.toLowerCase().includes(event.toLowerCase()));

      if (!matchedEvent) {
        db.close();
        return res.json({
          reply: `I couldn't find "${event}" in our events list. Could you check the name?`,
        });
      }

      db.close();
      const available = matchedEvent.tickets_total - matchedEvent.tickets_sold;
      return res.json({
        reply: `${parsed.reply}\nEvent: ${matchedEvent.name}\nTickets: ${tickets}\n(${available} available)\nWould you like to confirm this booking?`,
        context: { action: "confirm", event: matchedEvent.name, tickets },
      });
    }


    if (parsed.action === "confirm") {
      let { event, tickets } = parsed.data || {};
      let qty = Number(tickets) || 1;

      const fallbackContext = req.body.context || {}; // e.g. { event, tickets }
      if (!event && fallbackContext.event) event = fallbackContext.event;
      if (!tickets && fallbackContext.tickets) qty = Number(fallbackContext.tickets);

      if (!event || !String(event).trim()) {
        db.close();
        return res.json({
          reply: "I’m not sure which event you want to confirm. Could you say the event name again?",
        });
      }

      const matchedEvent =
        events.find((e) => e.name.toLowerCase() === event.toLowerCase()) ||
        events.find((e) => e.name.toLowerCase().includes(event.toLowerCase()));

      if (!matchedEvent) {
        db.close();
        return res.json({ reply: `I couldn’t find "${event}" in our list.` });
      }

      const available = matchedEvent.tickets_total - matchedEvent.tickets_sold;
      if (available < qty) {
        db.close();
        return res.json({
          reply: `Sorry, only ${available} tickets left for ${matchedEvent.name}.`,
        });
      }

      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE events
         SET tickets_sold = tickets_sold + ?
       WHERE id = ? AND (tickets_total - tickets_sold) >= ?`,
          [qty, matchedEvent.id, qty],
          function (err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });



      const updated = await new Promise((resolve, reject) => {
        db.get(`SELECT * FROM events WHERE id = ?`, [matchedEvent.id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      db.close();
      return res.json({
        reply: ` ${parsed.reply}\nSuccessfully booked ${qty} ticket(s) for ${updated.name}.`,
        updated,
      });
    }

    db.close();
    return res.json({ reply: "I'm not sure what to do yet!" });
  } catch (err) {
    console.error("Error in handleChat:", err);
    db.close();
    res.status(500).json({ error: "Failed to handle chat" });
  }
}




module.exports = { parseUserInput, confirmBooking, handleChat };
