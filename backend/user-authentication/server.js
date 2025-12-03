// backend/user-authentication/server.js
require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const db = require("./config/db");

const cors = require("cors");
const app = express();

app.use(cors({
  origin: "https://tiger-tix-rouge.vercel.app",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);

// Simple error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

const PORT = 4000;

// Test database connection and start server
function start() {
  db.serialize(() => {
    console.log("Connected to SQLite:", path.resolve(process.env.DB_FILE || "./shared/auth.db"));
    app.listen(PORT, () => console.log(`Auth service listening on port ${PORT}`));
  });
}

start();
