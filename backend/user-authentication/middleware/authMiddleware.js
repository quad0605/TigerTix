const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
let cachedPublicKey = null;
let cacheExpires = 0;

async function fetchPublicKeyIfNeeded() {
  const now = Date.now();
  console.log("dfkjlfdsjk");
  if (cachedPublicKey && now < cacheExpires) return cachedPublicKey;

  try {
    console.log("[Auth] Reading public key from file...");
    const keyPath = path.join(__dirname, "../../user-authentication/public.pem");
    const cachedPublicKey = fs.readFileSync(keyPath, "utf8");
    cacheExpires = now + (process.env.PUBLIC_KEY_TTL_MS ? Number(process.env.PUBLIC_KEY_TTL_MS) : 60_000);
    console.log("[Auth] Public key loaded and cached");
    return cachedPublicKey;
  } catch (e) {
    
    console.error("NO FILE", e);
    
  }
}

module.exports = async (req, res, next) => {
  try {
    console.log(`[Auth] Incoming request: ${req.method} ${req.path}`);
    console.log("[Auth] Cookies:", req.cookies);
    console.log("[Auth] Authorization header:", req.headers.authorization);

    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null);
    if (!token) return res.status(401).json({ error: "no_token_provided" });

    const publicKey = await fetchPublicKeyIfNeeded();
    const payload = jwt.verify(token, publicKey, { algorithms: ["RS256"], issuer: process.env.ISSUER });
    req.user = payload;
    next();
  } catch (err) {
    console.error("auth error:", err.message);
    return res.status(401).json({ error: "invalid_token" });
  }
};
