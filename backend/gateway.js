const express = require("express");
const proxy = require("express-http-proxy");
const { spawn } = require("child_process");

const app = express();

spawn("node", ["./admin-service/server.js"], { stdio: "inherit" });
spawn("node", ["./client-service/server.js"], { stdio: "inherit" });
spawn("node", ["./llm-driven-booking/server.js"], { stdio: "inherit" });
spawn("node", ["./user-authentication/server.js"], { stdio: "inherit" });

app.use("/api/admin", proxy("http://localhost:5001", {
  proxyReqPathResolver: req => {
    console.log("Proxying:", req.originalUrl.replace(/^\/api\/admin/, ''));
  }
}));

app.use("/api/client", proxy("http://localhost:6001"));

//app.use("/api/booking", proxy("http://localhost:4003"));
app.use("/api/auth",   proxy("http://localhost:4000"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("API Gateway running on port " + PORT);
});