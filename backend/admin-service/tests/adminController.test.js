const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const adminRoutes = require('../routes/adminRoutes');

// Setup in-memory test DB (temporary file)
const TEST_DB_PATH = path.join(__dirname, 'test.sqlite');
process.env.TEST_DB_PATH = TEST_DB_PATH; // <— add this

// Before each test, recreate DB schema
beforeEach((done) => {
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
  const db = new sqlite3.Database(TEST_DB_PATH);
  db.serialize(() => {
    db.run(`
      CREATE TABLE events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        date TEXT NOT NULL,
        tickets_total INTEGER NOT NULL CHECK (tickets_total >= 0),
        tickets_sold INTEGER NOT NULL DEFAULT 0 CHECK (tickets_sold >= 0)
      );
    `, done);
  });
});

// Override DB path in model
jest.mock('../models/adminModel', () => {
  const sqlite3 = require('sqlite3').verbose();
  const path = require('path');
  const DB_PATH = path.join(__dirname, 'test.sqlite');
  const { createEvent, updateEvent } = jest.requireActual('../models/adminModel');
  return {
    createEvent: (args) => {
      process.env.TEST_DB_PATH = DB_PATH;
      return createEvent(args);
    },
    updateEvent: (id, args) => {
      process.env.TEST_DB_PATH = DB_PATH;
      return updateEvent(id, args);
    },
  };
});

// Create express app for testing
const app = express();
app.use(bodyParser.json());
app.use('/api/admin', adminRoutes);
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message });
});


describe('Admin Controller Integration', () => {

  test('POST /api/admin/events creates a valid event', async () => {
    const res = await request(app)
      .post('/api/admin/events')
      .send({
        name: 'Test Event',
        date: '2025-12-01T12:00:00Z',
        tickets_total: 100
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Test Event');
    expect(res.body.tickets_total).toBe(100);
    expect(res.body.tickets_sold).toBe(0);
  });

  test('POST /api/admin/events rejects invalid date', async () => {
    const res = await request(app)
      .post('/api/admin/events')
      .send({
        name: 'Bad Event',
        date: 'not-a-date',
        tickets_total: 50
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/date must be a valid ISO/);
  });

  test('PUT /api/admin/events/:id updates an event', async () => {
    // Create event first
    const created = await request(app)
      .post('/api/admin/events')
      .send({
        name: 'Old Event',
        date: '2025-12-01T12:00:00Z',
        tickets_total: 50
      });

    const id = created.body.id;

    const res = await request(app)
      .put(`/api/admin/events/${id}`)
      .send({
        name: 'Updated Event',
        date: '2025-12-02T12:00:00Z',
        tickets_total: 75
      });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Event');
    expect(res.body.tickets_total).toBe(75);
  });

  test('PUT /api/admin/events/:id returns 404 for missing id', async () => {
    const res = await request(app)
      .put('/api/admin/events/999')
      .send({
        name: 'Not Found',
        date: '2025-12-02T12:00:00Z',
        tickets_total: 10
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });


});
