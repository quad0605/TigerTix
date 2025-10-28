const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const DB_PATH = path.resolve(__dirname, "..", "..", "shared-db", "database.sqlite");

function getDb() {
  return new sqlite3.Database(DB_PATH);
}

module.exports = { getDb, DB_PATH };
