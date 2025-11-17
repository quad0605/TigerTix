PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  date TEXT NOT NULL,                   
  tickets_total INTEGER NOT NULL CHECK (tickets_total >= 0),
  tickets_sold INTEGER NOT NULL CHECK(tickets_sold >= 0 AND tickets_sold <= tickets_total)
);
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT
);
