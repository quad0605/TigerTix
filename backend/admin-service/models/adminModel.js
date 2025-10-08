// backend/admin-service/models/adminModel.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

//builds path to sqlite database
const DB_PATH = path.join(__dirname, '..', '..', 'shared-db', 'database.sqlite');


//createEvent function, takes object with name, date, tickets_total, returns a promise 
function createEvent({ name, date, tickets_total }) {
  return new Promise((resolve, reject) => {
    //open database connection
    const db = new sqlite3.Database(DB_PATH);

    //placeholder SQL
    const sql = `
      INSERT INTO events (name, date, tickets_total, tickets_available)
      VALUES (?, ?, ?, ?)
    `;
    const values = [name, date, tickets_total, tickets_total];

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

module.exports = { createEvent };
