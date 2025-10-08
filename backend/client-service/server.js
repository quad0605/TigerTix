//dependencies: express is web framework for Node.js, cors for cross-origin requests
//clientRoutes handles /api/client routes
const express = require('express');
const cors = require('cors');
const clientRoutes = require('./routes/clientRoutes');

//port 6001 is used and app creates express application
const PORT = process.env.PORT || 6001;
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', clientRoutes);

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