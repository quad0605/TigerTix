const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "secret-example";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30m";

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd || process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    maxAge: 30 * 60 * 1000,
  };
}

// Register
exports.register = async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email and password required" });

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) return res.status(409).json({ error: "email already registered" });

    const hash = await bcrypt.hash(password, 10);

    db.run(
      "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
      [email, hash, name],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });

        const token = signToken({ sub: this.lastID, email });
        res.cookie("token", token, cookieOptions());
        res.status(201).json({ message: "registered", user: { id: this.lastID, email, name } });
      }
    );
  });
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email and password required" });

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: "invalid credentials" });

    const match = await bcrypt.compare(password, row.password);
    if (!match) return res.status(401).json({ error: "invalid credentials" });

    const token = signToken({ sub: row.id, email: row.email });
    res.cookie("token", token, cookieOptions());
    res.json({ message: "logged_in", user: { id: row.id, email: row.email, name: row.name } });
  });
};

// Get current user
exports.getMe = (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: "not_authenticated" });

  db.get("SELECT id, email, name FROM users WHERE id = ?", [userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "user_not_found" });
    res.json({ user: row });
  });
};


exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "logged_out" });
};


