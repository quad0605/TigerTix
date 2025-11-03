const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const llmRoutes = require('../routes/llmRoute');

const TEST_DB_PATH = path.join(__dirname, 'test_llm.sqlite');

/**
 * Test Setup: Database and Test Data Initialization
 * Creates fresh test database with sample events before each test
 * to ensure consistent state for LLM booking functionality
 * @setup beforeEach - Database Reset with Sample Data
 */
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
        ('Jazz Night', '2025-11-10', 100, 10),
        ('Sold Out Event', '2025-12-05', 25, 25);
      `, done);
    });
  });
});

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    responses: {
      create: jest.fn().mockResolvedValue({
        output: [{
          content: [{
            text: JSON.stringify({ event: "Jazz Night", tickets: 2 })
          }]
        }]
      })
    }
  }));
});

jest.mock('../models/llmModel', () => {
  const sqlite3 = require('sqlite3').verbose();
  const path = require('path');
  const TEST_DB = path.join(__dirname, 'test_llm.sqlite');
  
  function getDb() {
    return new sqlite3.Database(TEST_DB);
  }

  return { getDb };
});

const app = express();
app.use(bodyParser.json());
app.use('/api/llm', llmRoutes);

describe('LLM Controller Tests', () => {

  /**
   * Test Case: Natural Language Parsing Success
   * Verifies that the LLM service can successfully parse natural language
   * booking requests and extract event name and ticket quantity
   * @test POST /api/llm/parse - NLP Processing
   */
  test('POST /api/llm/parse successfully parses natural language input', async () => {
    const res = await request(app)
      .post('/api/llm/parse')
      .send({ text: "Book 2 tickets for Jazz Night" });

    expect(res.status).toBe(200);
    expect(res.body.parsed.event).toBe('Jazz Night');
    expect(res.body.parsed.tickets).toBe(2);
    expect(res.body.match.name).toBe('Jazz Night');
  });

  /**
   * Test Case: Missing Input Validation
   * Ensures that parse endpoint returns proper error when no text
   * input is provided in the request body
   * @test POST /api/llm/parse - Input Validation
   */
  test('POST /api/llm/parse returns 400 for missing text', async () => {
    const res = await request(app)
      .post('/api/llm/parse')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/missing text input/i);
  });

  /**
   * Test Case: Successful Ticket Booking
   * Verifies that the LLM service can successfully process ticket
   * purchases and update database with correct ticket counts
   * @test POST /api/llm/confirm - Booking Confirmation
   */
  test('POST /api/llm/confirm successfully books tickets', async () => {
    const res = await request(app)
      .post('/api/llm/confirm')
      .send({ event: "Jazz Night", tickets: 2 });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/successfully booked 2 ticket/i);
    expect(res.body.updated.tickets_sold).toBe(12);
  });

  /**
   * Test Case: Invalid Ticket Quantity Validation
   * Confirms that booking confirmation fails with proper error
   * when ticket quantity is not a valid positive integer
   * @test POST /api/llm/confirm - Input Validation
   */
  test('POST /api/llm/confirm returns 400 for invalid input', async () => {
    const res = await request(app)
      .post('/api/llm/confirm')
      .send({ event: "Jazz Night", tickets: "invalid" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/tickets.*must be.*positive integer/i);
  });

  /**
   * Test Case: Non-existent Event Handling
   * Verifies that booking attempts for events that don't exist
   * return appropriate 404 error with descriptive message
   * @test POST /api/llm/confirm - Error Handling
   */
  test('POST /api/llm/confirm returns 404 for non-existent event', async () => {
    const res = await request(app)
      .post('/api/llm/confirm')
      .send({ event: "Unknown Event", tickets: 1 });

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/event not found/i);
  });

  /**
   * Test Case: Sold Out Event Handling
   * Ensures that booking attempts for sold out events return
   * proper 409 conflict error indicating insufficient tickets
   * @test POST /api/llm/confirm - Inventory Management
   */
  test('POST /api/llm/confirm returns 409 for sold out event', async () => {
    const res = await request(app)
      .post('/api/llm/confirm')
      .send({ event: "Sold Out Event", tickets: 1 });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/not enough tickets available/i);
  });

});