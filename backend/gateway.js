const express = require("express");
const proxy = require("express-http-proxy");
const { spawn } = require("child_process");

const app = express();

spawn("node", ["./admin-service/server.js"], { stdio: "inherit" });
spawn("node", ["./client-service/server.js"], { stdio: "inherit" });
spawn("node", ["./llm-driven-booking/server.js"], { stdio: "inherit" });
spawn("node", ["./user-authentication/server.js"], { stdio: "inherit" });


app.use("/api/admin", proxy("http://localhost:5001", {
  proxyReqPathResolver: function (req) {
    return req.originalUrl;
  }
}));



app.use("/api/client", proxy("http://localhost:6001", {
  proxyReqPathResolver: function (req) {
    return req.originalUrl;
  }
}));


//app.use("/api/booking", proxy("http://localhost:4003"));
app.use("/api/auth",   proxy("http://localhost:4000", {
  proxyReqPathResolver: function (req) {
    return req.originalUrl;
  }
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("API Gateway running on port " + PORT);
});