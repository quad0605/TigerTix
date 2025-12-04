const express = require("express");
const proxy = require("express-http-proxy");
const { spawn } = require("child_process");
const cors = require("cors");


const app = express();
app.use(cors());
spawn("node", ["./admin-service/server.js"], { stdio: "inherit" });
spawn("node", ["./client-service/server.js"], { stdio: "inherit" });
spawn("node", ["./llm-driven-booking/server.js"], { stdio: "inherit" });
spawn("node", ["./user-authentication/server.js"], { stdio: "inherit" });

app.use("/api/admin", proxy("http://localhost:5001", {
  proxyReqPathResolver: function (req) {
    return '/api/admin' + req.url;
  }
}));

app.use("/api/client", proxy("http://localhost:6001", {
  proxyReqPathResolver: function (req) {
    return '/api/client' + req.url;
  }
}));

app.use("/api/llm", proxy("http://localhost:7001", {
  proxyReqPathResolver: function (req) {
    return '/api/booking' + req.url;
  }
}));

app.use("/api/auth",   proxy("http://localhost:4000", {
  proxyReqPathResolver: function (req) {
    return '/api/auth' + req.url;
  }
}));

const PORT =  3000;
app.listen(PORT, () => {
  console.log("API Gateway running on port " + PORT);
});