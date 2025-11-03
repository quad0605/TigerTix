const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const clientRoutes = require('../routes/clientRoutes');

const TEST_DB_PATH = path.join(__dirname, 'test_simple.sqlite');

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
    `, () => {
      db.run(`
        INSERT INTO events (name, date, tickets_total, tickets_sold) VALUES
        ('Jazz Night', '2025-11-10', 100, 0),
        ('Rock Concert', '2025-12-01', 50, 0),
        ('Sold Out Event', '2025-12-05', 25, 25),
        ('Limited Event', '2025-11-20', 3, 2);
      `, done);
    });
  });
});

jest.mock('../models/clientModel', () => {
  const sqlite3 = require('sqlite3').verbose();
  const path = require('path');
  const TEST_DB = path.join(__dirname, 'test_simple.sqlite');
  
  /**
 * Creates a connection to the test SQLite database.
 * 
 * @function getTestDb
 * @returns {sqlite3.Database} SQLite database connection to test database
 */
  function getTestDb() {
    return new sqlite3.Database(TEST_DB);
  }

  /**
 * Mock implementation of listEvents function for testing.
 * Queries the test database and returns all events ordered by date.
 * 
 * @function listEvents
 * @returns {Promise<Array<Object>>} Promise resolving to array of event objects
 * @throws {Error} Database connection or query errors
 */
  function listEvents() {
    return new Promise((resolve, reject) => {
      const db = getTestDb();
      db.all(
        `SELECT id, name, date, tickets_total, tickets_sold
         FROM events
         ORDER BY date ASC`,
        [],
        (err, rows) => {
          db.close();
          if (err) return reject(err);
          resolve(rows || []);
        }
      );
    });
  }
/**
 * Mock implementation of purchaseTicket function for testing.
 * Atomically increments tickets_sold for specified event if tickets available.
 * 
 * @function purchaseTicket
 * @param {number} eventId - ID of the event to purchase ticket for
 * @returns {Promise<Object>} Promise resolving to purchase result object
 * @returns {Promise<{status: "OK", event: Object}>} On successful purchase
 * @returns {Promise<{status: "NOT_FOUND"}>} When event ID doesn't exist
 * @returns {Promise<{status: "SOLD_OUT"}>} When no tickets remaining
 * @throws {Error} Database connection or query errors
 */
  function purchaseTicket(eventId) {
    return new Promise((resolve, reject) => {
      const db = getTestDb();
      
      const sql = `
        UPDATE events
        SET tickets_sold = tickets_sold + 1
        WHERE id = ? AND tickets_sold < tickets_total
      `;

      db.run(sql, [eventId], function (err) {
        if (err) {
          const ce = new Error('Internal Server error: ' + err.message); 
          ce.status = 500;
          db.close();
          return reject(ce);
        }

        if (this.changes === 0) {
          db.get(`SELECT id FROM events WHERE id = ?`, [eventId], (err2, row) => {
            db.close();
            if (err2) return reject(err2);
            if (!row) return resolve({ status: "NOT_FOUND" });
            return resolve({ status: "SOLD_OUT" });
          });
          return;
        }

        db.get(
          `SELECT id, name, date, tickets_total, tickets_sold
           FROM events WHERE id = ?`,
          [eventId],
          (err3, updatedRow) => {
            db.close();
            if (err3) return reject(err3);
            resolve({ status: "OK", event: updatedRow });
          }
        );
      });
    });
  }

  return { listEvents, purchaseTicket };
});

const app = express();
app.use(bodyParser.json());
app.use('/api', clientRoutes);


/**
 * Integration test suite for Client Controller API endpoints.
 * 
 * @description Tests the complete client-service functionality including:
 * - Event listing endpoint (GET /api/events)
 * - Ticket purchasing endpoint (POST /api/events/:id/purchase)
 * - Error handling for various edge cases
 * - Database consistency and concurrency scenarios
 * - Data integrity after multiple operations
 * 
 * @requires supertest For HTTP endpoint testing
 * @requires jest For test framework and mocking
 * @requires sqlite3 For test database operations
 */
describe('Client Controller Tests', () => {

  test('GET /api/events returns list of events', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(4);
  });

  test('POST /api/events/:id/purchase buys a ticket successfully', async () => {
    const res = await request(app).post('/api/events/1/purchase');
    expect(res.status).toBe(200);
    expect(res.body.event).toHaveProperty('tickets_sold', 1);
  });

  test('POST /api/events/:id/purchase returns 404 for missing event', async () => {
    const res = await request(app).post('/api/events/999/purchase');
    expect(res.status).toBe(404);
  });

  test('POST /api/events/:id/purchase returns 409 when sold out', async () => {
    const res = await request(app).post('/api/events/3/purchase');
    expect(res.status).toBe(409);
  });

  test('handles concurrent purchases without overselling', async () => {
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(request(app).post('/api/events/4/purchase'));
    }
    
    const results = await Promise.all(promises);
    const successful = results.filter(res => res.status === 200);
    const failed = results.filter(res => res.status === 409);
    
    expect(successful.length).toBe(1);
    expect(failed.length).toBe(4);
    expect(successful[0].body.event.tickets_sold).toBe(3);
  });

  test('maintains data integrity after multiple operations', async () => {
    await request(app).post('/api/events/2/purchase');
    await request(app).post('/api/events/2/purchase');
    
    const listRes = await request(app).get('/api/events');
    const rockConcert = listRes.body.find(event => event.name === 'Rock Concert');
    
    expect(rockConcert.tickets_sold).toBe(2);
    expect(rockConcert.tickets_total).toBe(50);
  });

});