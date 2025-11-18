(function(){
	// wrapped in an IIFE to avoid hoisting issues when running with other tests
})();

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Temporary test DB file for auth tests
const TEST_DB_PATH = path.join(__dirname, 'test_auth.sqlite');

// Mock the DB module so controllers use the test DB
jest.mock('../config/db', () => {
	const fsLocal = require('fs');
	const sqlite3Local = require('sqlite3').verbose();
	const pathLocal = require('path');
	const TEST_DB_PATH_LOCAL = pathLocal.join(__dirname, 'test_auth.sqlite');
	// Remove any previous test DB to start clean
	try { if (fsLocal.existsSync(TEST_DB_PATH_LOCAL)) fsLocal.unlinkSync(TEST_DB_PATH_LOCAL); } catch (e) {}
	const db = new sqlite3Local.Database(TEST_DB_PATH_LOCAL);
	db.serialize(() => {
		db.run(`
			CREATE TABLE users (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				email TEXT UNIQUE NOT NULL,
				password TEXT NOT NULL,
				name TEXT,
				createdAt TEXT DEFAULT (datetime('now'))
			);
		`);
	});
	return db;
});

const authRoutes = require('../routes/authRoutes');

// Increase Jest timeout for slower CI/dev machines where bcrypt/jwt may take time
jest.setTimeout(20000);

function createApp() {
	const app = express();
	app.use(bodyParser.json());
	app.use(cookieParser());
	app.use('/api/auth', authRoutes);
	// simple error handler for tests
	app.use((err, req, res, next) => {
		res.status(err.status || 500).json({ error: err.message || 'test_error' });
	});
	return app;
}

describe('Auth Routes Integration', () => {
	const app = createApp();

	afterAll(() => {
		// cleanup test DB file
		try { if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH); } catch (e) {}
	});

	test('POST /api/auth/register creates a user and sets cookie', async () => {
		const res = await request(app)
			.post('/api/auth/register')
			.send({ email: 'test@example.com', password: 'Password1!', name: 'Tester' });

		expect(res.status).toBe(201);
		expect(res.body).toHaveProperty('user');
		expect(res.body.user).toHaveProperty('email', 'test@example.com');
		const setCookie = res.headers['set-cookie'];
		expect(setCookie).toBeDefined();
		expect(setCookie.some(s => /token=/.test(s))).toBe(true);
	});

	test('POST /api/auth/register returns 409 for duplicate email', async () => {
		await request(app)
			.post('/api/auth/register')
			.send({ email: 'dupe@example.com', password: 'Password1!', name: 'Dupe' });

		const res = await request(app)
			.post('/api/auth/register')
			.send({ email: 'dupe@example.com', password: 'Password1!', name: 'Dupe' });

		expect(res.status).toBe(409);
		expect(res.body.error).toMatch(/email already registered/i);
	});

	test('POST /api/auth/login authenticates and returns cookie', async () => {
		await request(app)
			.post('/api/auth/register')
			.send({ email: 'login@example.com', password: 'Password1!', name: 'Loginer' });

		const res = await request(app)
			.post('/api/auth/login')
			.send({ email: 'login@example.com', password: 'Password1!' });

		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty('user');
		expect(res.body.user.email).toBe('login@example.com');
		const setCookie = res.headers['set-cookie'];
		expect(setCookie).toBeDefined();
		expect(setCookie.some(s => /token=/.test(s))).toBe(true);
	});

	test('GET /api/auth/me returns 401 without token and 200 with token', async () => {
		const unauth = await request(app).get('/api/auth/me');
		expect(unauth.status).toBe(401);

		// register and login to get cookie
		await request(app)
			.post('/api/auth/register')
			.send({ email: 'me@example.com', password: 'Password1!', name: 'Me' });

		const loginRes = await request(app)
			.post('/api/auth/login')
			.send({ email: 'me@example.com', password: 'Password1!' });

		const cookies = loginRes.headers['set-cookie'];
		const meRes = await request(app).get('/api/auth/me').set('Cookie', cookies);
		expect(meRes.status).toBe(200);
		expect(meRes.body).toHaveProperty('user');
		expect(meRes.body.user.email).toBe('me@example.com');
	});

	test('POST /api/auth/logout clears cookie', async () => {
		await request(app)
			.post('/api/auth/register')
			.send({ email: 'out@example.com', password: 'Password1!', name: 'Out' });

		const loginRes = await request(app)
			.post('/api/auth/login')
			.send({ email: 'out@example.com', password: 'Password1!' });

		const cookies = loginRes.headers['set-cookie'];
		const res = await request(app).post('/api/auth/logout').set('Cookie', cookies);
		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty('message', 'logged_out');
		const setCookie = res.headers['set-cookie'];
		expect(setCookie).toBeDefined();
		expect(setCookie.some(s => /token=;/.test(s) || /token=.+; Expires=Thu, 01 Jan 1970 00:00:00 GMT/.test(s))).toBe(true);
	});
});

