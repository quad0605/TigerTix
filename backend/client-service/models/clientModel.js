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