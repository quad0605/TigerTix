// backend/client-service/models/clientModel.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

//builds path to sqlite database
const DB_PATH = path.resolve(__dirname, '..', '..', 'shared-db', 'database.sqlite')

function getDb() { return new sqlite3.Database(DB_PATH); }

function listEvents() {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.all(
            `SELECT id, name, date, tickets_total, tickets_available
         FROM events
         ORDER BY date ASC`,
      [],
      (err, rows) => {
        db.close();
        if(err) return reject(err);
        resolve(rows || []);
      }
    );
  });
}
function purchaseTicket(eventId) {
  return new Promise((resolve, reject) => {
    const db = getDb();

    // Try to decrement only if tickets are available
    const sql = `
      UPDATE events
      SET tickets_available = tickets_available - 1
      WHERE id = ? AND tickets_available > 0
    `;

    db.run(sql, [eventId], function (err) {
      if (err) {
        db.close();
        return reject(err);
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
        `SELECT id, name, date, tickets_total, tickets_available
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