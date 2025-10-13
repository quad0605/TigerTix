// backend/admin-service/models/adminModel.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

//builds path to sqlite database
const DB_PATH = path.join(__dirname, '..', '..', 'shared-db', 'database.sqlite');


/**
 * Create a new event.
 * Inserts a new row into the events table and returns the created row.
 *
 * @param {
 * { name: string, date: string, tickets_total: number }
 * } event The values for the new event
 * @returns {
 *    Promise<{ 
 *              id: number, 
 *              name: string, 
 *              date: string, 
 *              tickets_total: number, 
 *              tickets_sold: number }>
 * } The new event's values including tickets_sold(cannot be changed by admin) 
 */
function createEvent({ name, date, tickets_total}) {
  return new Promise((resolve, reject) => {
    //open database connection
    const db = new sqlite3.Database(DB_PATH);

    //placeholder SQL
    const sql = `
      INSERT INTO events (name, date, tickets_total, tickets_sold)
      VALUES (?, ?, ?, ?)
    `;
    const values = [name, date, tickets_total, 0];

    //runs sql insert
    db.run(sql, values, function (err) {
      if (err) {
        db.close();
        return reject(err);
      }
      //generates a key for the new event
      const newId = this.lastID;
      //retrieves the new event by its id
      db.get(
        `SELECT id, name, date, tickets_total, tickets_sold
           FROM events WHERE id = ?`,
        [newId],
        (err2, row) => {
          db.close();
          if (err2) return reject(err2);
          resolve(row);
        }
      );
    });
  });
}

/**
 * Update an existing event.
 *
 * Validates that the new tickets_total is not less than tickets_sold, runs the UPDATE,
 * and returns the updated row. Resolves with null when the event id does not exist.
 *
 * @param {number} id - Event id to update.
 * @param {{ name: string, date: string, tickets_total: number }} data The new event data
 * @returns {
 *    Promise<null | { 
 *                    id: number, 
 *                    name: string, 
 *                    date: string, 
 *                    tickets_total: number, 
 *                    tickets_sold: number }>
 * } The new event data if event is succefully updated
 */
function updateEvent(id, { name, date, tickets_total }) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);

    db.get(
      'SELECT tickets_total AS old_total, tickets_sold AS old_sold FROM events WHERE id = ?',
      [id],
      (err, row) => {
        if (err) {
          db.close();
          return reject(err);
        }
        if (!row) {
          db.close();
          return resolve(null); // not found
        }

        const oldSold = Number(row.old_sold || 0);
        const newTotal = Number(tickets_total);

        // Pre-validate against tickets_sold so CHECK constraint is not violated.
        if (newTotal < oldSold) {
          db.close();
          const e = new Error('tickets_total cannot be less than tickets_sold');
          e.status = 400;
          return reject(e);
        }

        const sql =
          'UPDATE events SET name = ?, date = ?, tickets_total = ? WHERE id = ?';
        db.run(sql, [name, date, newTotal, id], function (err2) {
          if (err2) {
            db.close();
            // Surface DB constraint errors as 400 for clearer client feedback
            if (err2.code === 'SQLITE_CONSTRAINT') {
              const ce = new Error('DB constraint violation: ' + err2.message);
              ce.status = 400;
              return reject(ce);
            }
            return reject(err2);
          }

          db.get(
            'SELECT id, name, date, tickets_total, tickets_sold FROM events WHERE id = ?',
            [id],
            (err3, updatedRow) => {
              db.close();
              if (err3) return reject(err3);
              resolve(updatedRow);
            }
          );
        });
      }
    );
  });
}


module.exports = { createEvent, updateEvent };