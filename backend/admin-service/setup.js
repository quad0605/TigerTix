// Setup script for initializing the SQLite database
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();


// Define paths for database directory, and database file, and init SQL script
const DB_DIR = '/shared-db'; 
const DB_PATH = path.join(DB_DIR, 'database.sqlite');
const INIT_SQL_PATH = path.join(DB_DIR, 'init.sql');


/**
 * Initialize the SQLite database.
 *
 * Ensures the shared-db directory exists, reads the SQL from init.sql,
 * executes it against the database file, and resolves when complete.
 *
 * @returns {Promise<void>} Resolves when the database initialization completes.
 */
function initDb() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  //opens the databse file
  const db = new sqlite3.Database(DB_PATH);
  //reads the init.sql file
  const initSql = fs.readFileSync(INIT_SQL_PATH, 'utf8');

  return new Promise((resolve, reject) => {
    db.exec(initSql, (err) => {
      db.close(); // Close the connection after init
      if (err) return reject(err);
      resolve();
    });
  });
}

module.exports = { initDb, DB_PATH };
