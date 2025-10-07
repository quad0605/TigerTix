const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'shared-db', 'database.sqlite');

function createEvent({ name, date, tickets_total }) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);

    const sql = `
      INSERT INTO events (name, date, tickets_total, tickets_available)
      VALUES (?, ?, ?, ?)
    `;
    const values = [name, date, tickets_total, tickets_total];

    db.run(sql, values, function (err) {
      if (err) {
        db.close();
        return reject(err);
      }
      const newId = this.lastID;
      db.get(
        `SELECT id, name, date, tickets_total, tickets_available
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

function getAllEvents() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);
    
    const sql = `SELECT id, name, date, tickets_total, tickets_available FROM events ORDER BY date`;
    
    db.all(sql, [], (err, rows) => {
      db.close();
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

module.exports = { createEvent, getAllEvents };
