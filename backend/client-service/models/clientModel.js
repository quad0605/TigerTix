// backend/client-service/models/clientModel.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

//builds path to sqlite database
const DB_PATH = path.resolve(__dirname, '..', '..', 'shared-db', 'database.sqlite')

/**
 * Open a new sqlite3 Database connection to the shared DB file.
 *
 * Caller is responsible for closing the returned Database when finished.
 *
 * @returns {import('sqlite3').Database}
 */
function getDb() { return new sqlite3.Database(DB_PATH); }

/**
 * List all events ordered by date ascending.
 *
 * @returns {Promise<Array<{ 
 *            id: number, 
 *            name: string, 
 *            date: string, 
 *            tickets_total: number, 
 *            tickets_sold: number }>>
 * } Simply returns an array of events(including id, the name, the total tickets, 
 * and the amount of tickets sold) or nothing 
 */
function listEvents() {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.all(
      `SELECT id, name, date, tickets_total, tickets_sold
         FROM events
         ORDER BY date ASC`,
      [],
      (err, rows) => {
        db.close();
        if (err) return reject(err);
        resolve(rows || []);
      }
    );
  });
}

/**
 * Purchase a ticket for an event (increments tickets_sold if available).
 *

 *
 * @param {number} eventId - Event id to purchase a ticket for.
 * @returns {Promise<
     { status: "OK", event: { id:number, name:string, date:string, tickets_total:number, tickets_sold:number } }
   | { status: "NOT_FOUND" }
   | { status: "SOLD_OUT" }
 >} Attempts an atomic update and resolves with:
 * { status: "OK", event }    on success (where event is the updated row)
 * { status: "NOT_FOUND" }    if the event id does not exist
 * { status: "SOLD_OUT" }     if the event has no tickets remaining
 */
function purchaseTicket(eventId) {
  return new Promise((resolve, reject) => {
    const db = getDb();

    // Try to decrement only if tickets are available
    const sql = `
      UPDATE events
      SET tickets_sold = tickets_sold + 1
      WHERE id = ? AND tickets_sold < tickets_total
    `;

    db.run(sql, [eventId], function (err) {
      if (err) {
        const ce = new Error('Internal Server error: ' + err.message); 
        ce.status = 500;
        db.close();
        return reject(ce);
      }

      // If no rows were updated, either sold out or not found
      if (this.changes === 0) {
        db.get(`SELECT id FROM events WHERE id = ?`, [eventId], (err2, row) => {
          db.close();
          if (err2) return reject(err2);
          if (!row) return resolve({ status: "NOT_FOUND" });
          return resolve({ status: "SOLD_OUT" });
        });
        return;
      }

      // Return updated event info
      db.get(
        `SELECT id, name, date, tickets_total, tickets_sold
         FROM events WHERE id = ?`,
        [eventId],
        (err3, updatedRow) => {
          db.close();
          if (err3) return reject(err3);
          resolve({ status: "OK", event: updatedRow });
        }
      );
    });
  });
}

module.exports = { listEvents, purchaseTicket };