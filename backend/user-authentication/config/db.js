const sqlite3 = require("sqlite3").verbose();
const path = require("path");
require("dotenv").config();

const DB_PATH = path.join(__dirname, "../../shared-db/database.sqlite");

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error("Failed to connect to SQLite:", err);
  else console.log("Connected to SQLite:", DB_PATH);
});

module.exports = db;
