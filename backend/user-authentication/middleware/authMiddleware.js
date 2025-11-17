const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secret-example";

module.exports = (req, res, next) => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!token) return res.status(401).json({ error: "no_token_provided" });

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.status(401).json({ error: "invalid_token" });
    req.userId = payload.sub;
    req.userEmail = payload.email;
    next();
  });
};
