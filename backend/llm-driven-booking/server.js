const express = require("express");
const cors = require("cors");
require("dotenv").config();

const llmRoutes = require("./routes/llmRoute");

const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Health check route
app.get("/health", (req, res) => {
  res.json({ ok: true, service: "llm-driven-booking" });
});

// Mount LLM routes
app.use("/api/llm", llmRoutes);

const PORT = process.env.PORT || 7001;
app.listen(PORT, () => {
  console.log(`✅ LLM service running on http://localhost:${PORT}`);
  console.log("POST /api/llm/parse → interpret text with GPT");
  console.log("POST /api/llm/confirm → confirm ticket booking");
});
