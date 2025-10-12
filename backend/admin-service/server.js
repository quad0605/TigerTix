//dependencies: express is web framework for Node.js, cors for cross-origin requests
//initDb sets up the database if not already done, adminRoutes handles /api/admin routes
const express = require('express');
const cors = require('cors');
const { initDb } = require('./setup');
const adminRoutes = require('./routes/adminRoutes');

//port 5001 is used and app creates express application
const PORT = process.env.PORT || 5001;
const app = express();

//cors allows cross-origin requests, express.json parses JSON body
app.use(cors());
app.use(express.json());

app.use('/api/admin', adminRoutes);

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[Admin Service] ', err.stack || err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Server start up
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Admin service running on http://localhost:${PORT}`);
    });
  })
  .catch((e) => {
    console.error('DB init failed:', e);
    process.exit(1);
  });
