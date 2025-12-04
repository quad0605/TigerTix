//dependencies: express is web framework for Node.js, cors for cross-origin requests
//clientRoutes handles /api/client routes
const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");

//port 6001 is used and app creates express application
const PORT =  6001;
const app = express();


// MUST be before any routes that need req.cookies

const clientRoutes = require('./routes/clientRoutes');
app.use(cors({
  origin: 'https://tiger-tix-rouge.vercel.app',
  credentials: true
}));
app.use(express.json());

app.use(cookieParser());
app.use('/api/client', clientRoutes);

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[Client Service] ', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Server start up
app.listen(PORT, () => {
  console.log(`Client service running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
  console.log(' GET events: GET /api/events');
  console.log(`   POST /api/events/:id/purchase`);
});