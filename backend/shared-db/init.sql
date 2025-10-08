PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  date TEXT NOT NULL,                   
  tickets_total INTEGER NOT NULL CHECK (tickets_total >= 0),
  tickets_available INTEGER NOT NULL CHECK (tickets_available >= 0)
);
