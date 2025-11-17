const db = require("../config/db");

// GET /api/auth/me
exports.getMe = (req, res, next) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: "not_authenticated" });
  }

  db.get(
    "SELECT id, email, name, createdAt FROM users WHERE id = ?",
    [userId],
    (err, row) => {
      if (err) return next(err); // passes error to your error handler
      if (!row) return res.status(404).json({ error: "user_not_found" });

      res.json({ user: row });
    }
  );
};
