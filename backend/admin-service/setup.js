const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_DIR = path.join(__dirname, '..', 'shared-db');
const DB_PATH = path.join(DB_DIR, 'database.sqlite');
const INIT_SQL_PATH = path.join(DB_DIR, 'init.sql');

function initDb() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  const db = new sqlite3.Database(DB_PATH);
  const initSql = fs.readFileSync(INIT_SQL_PATH, 'utf8');

  return new Promise((resolve, reject) => {
    db.exec(initSql, (err) => {
      if (err) return reject(err);
      resolve(db); // you can ignore this return in server.js
    });
  });
}

module.exports = { initDb, DB_PATH };
